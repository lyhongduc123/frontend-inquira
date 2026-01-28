import { useState, useRef, useCallback } from "react";
import { Message } from "@/types/message.type";
import { streamEvent, PhaseEvent, ThoughtEvent, AnalysisEvent } from "@/lib/stream";
import { PaperSource } from "@/types/paper.type";
import { useConversation } from "./use-conversation";
import { useConversationStore } from "@/store/conversation-store";
import { useAuthStore } from "@/store/auth-store";

interface UseChatOptions {
  apiEndpoint?: string;
  onConversationCreated?: (conversationId: string) => void;
  onPhase?: (event: PhaseEvent) => void;
  onThought?: (event: ThoughtEvent) => void;
  onAnalysis?: (event: AnalysisEvent) => void;
  onError?: () => void;
}

interface StreamState {
  isStreaming: boolean;
  isError: boolean;
  lastFailedQuery: string | null;
}

export function useChat(options: UseChatOptions = {}) {
  const { 
    apiEndpoint = "/api/test/stream", 
    onConversationCreated,
    onPhase,
    onThought,
    onAnalysis,
    onError: onErrorCallback,
  } = options;
  const { createConversation } = useConversation();

  const messages = useConversationStore((state) => state.messages);
  const setMessages = useConversationStore((state) => state.setMessages);
  const [streamState, setStreamState] = useState<StreamState>({
    isStreaming: false,
    isError: false,
    lastFailedQuery: null,
  });

  const accumulatedTextRef = useRef("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);

  const resetStreamState = useCallback(() => {
    setStreamState((prev) => ({
      ...prev,
      isError: false,
      lastFailedQuery: null,
    }));
  }, []);

  const addUserMessage = useCallback(
    (text: string) => {
      const currentMessages = useConversationStore.getState().messages;
      setMessages([...currentMessages, { role: "user", text } as Message]);
    },
    [setMessages]
  );

  const addAssistantMessage = useCallback(() => {
    const currentMessages = useConversationStore.getState().messages;
    console.log("Adding assistant message, current messages:", currentMessages.length);
    setMessages([...currentMessages, { role: "assistant", text: "" } as Message]);
  }, [setMessages]);

  const updateLastMessage = useCallback(
    (updates: Partial<Message>) => {
      // Only update if this is still the active conversation
      const currentConvId = useConversationStore.getState().currentConversationId;
      if (currentConvId !== activeConversationIdRef.current) {
        console.log("Ignoring update for old conversation");
        return; // Ignore updates for old conversations
      }
      
      const currentMessages = useConversationStore.getState().messages;
      const last = currentMessages[currentMessages.length - 1];
      console.log("Updating last message:", updates);
      setMessages([...currentMessages.slice(0, -1), { ...last, ...updates }]);
    },
    [setMessages]
  );

  const sendMessage = useCallback(
    async (query: string, conversationId?: string | null) => {
      // Abort any ongoing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      resetStreamState();
      addUserMessage(query);
      
      // Only create conversation if user is authenticated and not using test endpoint
      const isTestEndpoint = apiEndpoint.includes('/test');
      const { isAuthenticated } = useAuthStore.getState();
      
      try {
        if (!conversationId && !isTestEndpoint && isAuthenticated) {
          // Create conversation with user query as title
          const newConversation = await createConversation(query);
          conversationId = newConversation.id;
          onConversationCreated?.(conversationId);
        }
      } catch (error) {
        console.error("Error creating conversation:", error);
        // Continue even if conversation creation fails for test endpoint
        if (!isTestEndpoint) {
          throw error;
        }
      }

      // Track active conversation for this stream
      activeConversationIdRef.current = conversationId || null;
      
      addAssistantMessage();

      setStreamState((prev) => ({ ...prev, isStreaming: true }));
      accumulatedTextRef.current = "";
      
      // Create new abort controller for this stream
      abortControllerRef.current = new AbortController();
      
      // Register abort callback with store
      useConversationStore.getState().setAbortStream(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      });

      try {
        await streamEvent(
          apiEndpoint,
          { query, conversation_id: conversationId || undefined },
          {
            onConversation: (id) => {
              onConversationCreated?.(id);
            },
            onMetadata: (papers: PaperSource[]) => {
              updateLastMessage({ sources: papers });
            },
            onPhase: (event) => {
              onPhase?.(event);
            },
            onThought: (event) => {
              onThought?.(event);
            },
            onAnalysis: (event) => {
              onAnalysis?.(event);
            },
            onChunk: (chunk) => {
              console.log("Received chunk:", chunk);
              accumulatedTextRef.current += chunk;
              console.log("Accumulated text:", accumulatedTextRef.current);
              updateLastMessage({ text: accumulatedTextRef.current });
            },
            onDone: () => {
              updateLastMessage({
                text: accumulatedTextRef.current,
                done: true,
              });
            },
            onError: (error) => {
              console.error("Stream error:", error);
              updateLastMessage({
                text: "Error: Failed to get response from server.",
                done: true,
              });
              onErrorCallback?.();
              setStreamState({
                isStreaming: false,
                isError: true,
                lastFailedQuery: query,
              });
            },
          }
        );
      } catch (error) {
        console.error("Streaming error:", error);
        // Only show error if this is still the active conversation
        if (useConversationStore.getState().currentConversationId === activeConversationIdRef.current) {
          updateLastMessage({
            text: "Error: Failed to get response from server.",
          });
        }
        onErrorCallback?.();
        setStreamState({
          isStreaming: false,
          isError: true,
          lastFailedQuery: query,
        });
      } finally {
        setStreamState((prev) => ({ ...prev, isStreaming: false }));
        abortControllerRef.current = null;
        activeConversationIdRef.current = null;
        useConversationStore.getState().setAbortStream(null);
      }
    },
    [
      apiEndpoint,
      onConversationCreated,
      onPhase,
      onThought,
      onAnalysis,
      onErrorCallback,
      resetStreamState,
      addUserMessage,
      addAssistantMessage,
      updateLastMessage,
      createConversation,
    ]
  );

  const retry = useCallback(() => {
    if (streamState.lastFailedQuery) {
      // Remove last two messages (failed user message and error response)
      const currentMessages = useConversationStore.getState().messages;
      setMessages(currentMessages.slice(0, -2));
      sendMessage(streamState.lastFailedQuery);
    }
  }, [streamState.lastFailedQuery, setMessages, sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    resetStreamState();
  }, [setMessages, resetStreamState]);

  const setMessagesDirectly = useCallback(
    (newMessages: Message[]) => {
      setMessages(newMessages);
    },
    [setMessages]
  );

  return {
    messages,
    isStreaming: streamState.isStreaming,
    isError: streamState.isError,
    sendMessage,
    retry,
    clearMessages,
    setMessages: setMessagesDirectly,
  };
}
