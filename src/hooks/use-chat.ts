import { useState, useRef, useCallback } from "react";
import { Message } from "@/types/message.type";
import { streamEvent } from "@/lib/stream";
import { PaperSource } from "@/types/paper.type";
import { useConversation } from "./use-conversation";
import { useConversationStore } from "@/store/conversation-store";

interface UseChatOptions {
  apiEndpoint?: string;
  onConversationCreated?: (conversationId: string) => void;
}

interface StreamState {
  isStreaming: boolean;
  isError: boolean;
  lastFailedQuery: string | null;
}

export function useChat(options: UseChatOptions = {}) {
  const { apiEndpoint = "/api/test-stream", onConversationCreated } = options;
  const { createConversation } = useConversation();

  const messages = useConversationStore((state) => state.messages);
  const setMessages = useConversationStore((state) => state.setMessages);
  const [streamState, setStreamState] = useState<StreamState>({
    isStreaming: false,
    isError: false,
    lastFailedQuery: null,
  });

  const accumulatedTextRef = useRef("");

  const resetStreamState = useCallback(() => {
    setStreamState((prev) => ({
      ...prev,
      isError: false,
      lastFailedQuery: null,
    }));
  }, []);

  const addUserMessage = useCallback(
    (text: string) => {
      setMessages([...messages, { role: "user", text } as Message]);
    },
    [messages, setMessages]
  );

  const addAssistantMessage = useCallback(() => {
    setMessages([...messages, { role: "assistant", text: "" } as Message]);
  }, [messages, setMessages]);

  const updateLastMessage = useCallback(
    (updates: Partial<Message>) => {
      const last = messages[messages.length - 1];
      setMessages([...messages.slice(0, -1), { ...last, ...updates }]);
    },
    [messages, setMessages]
  );

  const sendMessage = useCallback(
    async (query: string, conversationId?: string | null) => {
      resetStreamState();
      addUserMessage(query);
      try {
        if (!conversationId) {
          const newConversation = await createConversation();
          conversationId = newConversation.id;
          onConversationCreated?.(conversationId);
        }
      } catch (error) {
        throw error;
      }

      addAssistantMessage();

      setStreamState((prev) => ({ ...prev, isStreaming: true }));
      accumulatedTextRef.current = "";

      try {
        await streamEvent(
          apiEndpoint,
          { query, conversation_id: conversationId || undefined },
          {
            onConversation: (id) => {
              onConversationCreated?.(id);
            },
            onSources: (sources: PaperSource[]) => {
              updateLastMessage({ sources });
            },
            onChunk: (chunk) => {
              accumulatedTextRef.current += chunk;
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
        updateLastMessage({
          text: "Error: Failed to get response from server.",
        });
        setStreamState({
          isStreaming: false,
          isError: true,
          lastFailedQuery: query,
        });
      } finally {
        setStreamState((prev) => ({ ...prev, isStreaming: false }));
      }
    },
    [
      apiEndpoint,
      onConversationCreated,
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
      setMessages(messages.slice(0, -2));
      sendMessage(streamState.lastFailedQuery);
    }
  }, [streamState.lastFailedQuery, messages, setMessages, sendMessage]);

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
