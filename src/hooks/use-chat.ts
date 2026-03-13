import { useState, useRef, useCallback } from "react";
import { Message } from "@/types/message.type";
import { streamEvent, StreamEventPayload } from "@/lib/stream/stream";
import { useConversation } from "./use-conversation";
import { useConversationStore } from "@/store/conversation-store";
import { useAuthStore } from "@/store/auth-store";
import { useProgressStore } from "@/store/progress-store";
import { MetadataEvent, ProgressEvent } from "@/lib/stream/event.types";

interface UseChatOptions {
  apiEndpoint?: string;
  onConversationCreated?: (conversationId: string) => void;
  onProgress?: (event: ProgressEvent) => void;
  onError?: () => void;
}

interface StreamState {
  isStreaming: boolean;
  isError: boolean;
  lastFailedQuery: string | null;
  lastClientMessageId: string | null;
}
// "/api/test/stream"
export function useChat(options: UseChatOptions = {}) {
  const {
    apiEndpoint = "/api/v1/chat/stream",
    onConversationCreated,
    onProgress,
    onError: onErrorCallback,
  } = options;
  const { createConversation } = useConversation();

  const messages = useConversationStore((state) => state.messages);
  const setMessages = useConversationStore((state) => state.setMessages);
  const { startQuery, addProgress, completeQuery } = useProgressStore();

  const [streamState, setStreamState] = useState<StreamState>({
    isStreaming: false,
    isError: false,
    lastFailedQuery: null,
    lastClientMessageId: null,
  });

  const accumulatedTextRef = useRef("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);
  const currentQueryIdRef = useRef<string | null>(null);

  const resetStreamState = useCallback(() => {
    setStreamState((prev) => ({
      ...prev,
      isError: false,
      lastFailedQuery: null,
      lastClientMessageId: null,
    }));
  }, []);

  const addUserMessage = useCallback(
    (text: string) => {
      const currentMessages = useConversationStore.getState().messages;
      setMessages([...currentMessages, { role: "user", text } as Message]);
    },
    [setMessages],
  );

  const addAssistantMessage = useCallback(() => {
    const currentMessages = useConversationStore.getState().messages;
    console.log(
      "Adding assistant message, current messages:",
      currentMessages.length,
    );
    setMessages([
      ...currentMessages,
      { role: "assistant", text: "" } as Message,
    ]);
  }, [setMessages]);

  const updateLastMessage = useCallback(
    (updates: Partial<Message>) => {
      const currentConvId =
        useConversationStore.getState().currentConversationId;
      if (currentConvId !== activeConversationIdRef.current) {
        console.log("Ignoring update for old conversation");
        return; // Ignore updates for old conversations
      }

      const currentMessages = useConversationStore.getState().messages;
      const last = currentMessages[currentMessages.length - 1];
      console.log("Updating last message:", updates);
      setMessages([...currentMessages.slice(0, -1), { ...last, ...updates }]);
    },
    [setMessages],
  );

  const sendMessage = useCallback(
    async (payload: StreamEventPayload) => {
      const {
        query,
        conversationId,
        isRetry = false,
        clientMessageId,
        pipeline = "database",
        useHybridPipeline,
        model,
      } = payload;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (!isRetry) {
        resetStreamState();
      }

      // Generate or use existing client message ID
      const messageId =
        clientMessageId ||
        `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Generate unique query ID for progress tracking
      const queryId = `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      currentQueryIdRef.current = queryId;

      // Initialize progress tracking for this query
      startQuery(queryId, query, conversationId);

      // Add user message with query ID in metadata (only if not retry)
      if (!isRetry) {
        const currentMessages = useConversationStore.getState().messages;
        setMessages([
          ...currentMessages,
          {
            role: "user",
            text: query,
            metadata: { query_id: queryId, client_message_id: messageId },
          } as Message,
        ]);
      }

      const isTestEndpoint = apiEndpoint.includes("/test");
      const { isAuthenticated } = useAuthStore.getState();

      try {
        if (!conversationId && !isTestEndpoint && isAuthenticated) {
          const newConversation = await createConversation(query);
          const conversationId = newConversation.id;
          if (conversationId) {
            onConversationCreated?.(conversationId);
            // Update query progress with conversation ID
            startQuery(queryId, query, conversationId);
          }
        }
      } catch (error) {
        console.error("Error creating conversation:", error);
        if (!isTestEndpoint) {
          throw error;
        }
      }

      // Track active conversation for this stream
      activeConversationIdRef.current = conversationId || null;

      addAssistantMessage();

      setStreamState((prev) => ({ ...prev, isStreaming: true }));
      accumulatedTextRef.current = "";
      abortControllerRef.current = new AbortController();
      useConversationStore.getState().setAbortStream(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      });

      try {
        await streamEvent(
          apiEndpoint,
          {
            query: query,
            conversationId: conversationId || undefined,
            isRetry: isRetry,
            clientMessageId: messageId,
            pipeline: pipeline,
            useHybridPipeline: useHybridPipeline, // Backward compatibility
            model: model,
          },
          {
            onMetadata: (event: MetadataEvent) => {
              updateLastMessage({ paperSnapshots: event.papers });
            },
            onProgress: (event: ProgressEvent) => {
              console.log("Progress event:", event.type, event.content);
              if (currentQueryIdRef.current) {
                addProgress(currentQueryIdRef.current, event);
              }
              onProgress?.(event);
            },
            onChunk: (chunk) => {
              console.log("Received chunk:", chunk);
              accumulatedTextRef.current += chunk;
              updateLastMessage({ text: accumulatedTextRef.current });
            },
            onDone: () => {
              if (currentQueryIdRef.current) {
                const queryProgress = useProgressStore
                  .getState()
                  .getQueryProgress(currentQueryIdRef.current);
                if (queryProgress && queryProgress.steps.length > 0) {
                  updateLastMessage({
                    text: accumulatedTextRef.current,
                    done: true,
                    progressEvents: queryProgress.steps,
                  });
                } else {
                  updateLastMessage({
                    text: accumulatedTextRef.current,
                    done: true,
                  });
                }
                completeQuery(currentQueryIdRef.current);
              } else {
                updateLastMessage({
                  text: accumulatedTextRef.current,
                  done: true,
                });
              }
            },
            onError: (error) => {
              console.error("Stream error:", error);
              updateLastMessage({
                text:
                  error.message || "Error: Failed to get response from server.",
                done: true,
                isError: true,
              });

              if (currentQueryIdRef.current) {
                completeQuery(currentQueryIdRef.current);
              }

              onErrorCallback?.();
              setStreamState({
                isStreaming: false,
                isError: true,
                lastFailedQuery: query,
                lastClientMessageId: messageId,
              });
            },
          },
          {
            signal: abortControllerRef.current.signal,
            heartbeatTimeout: 0,
          },
        );
      } catch (error) {
        console.error("Streaming error:", error);
        if (
          useConversationStore.getState().currentConversationId ===
          activeConversationIdRef.current
        ) {
          updateLastMessage({
            text: "Error: Failed to get response from server.",
            done: true,
            isError: true,
          });
        }

        if (currentQueryIdRef.current) {
          completeQuery(currentQueryIdRef.current);
        }

        onErrorCallback?.();
        setStreamState({
          isStreaming: false,
          isError: true,
          lastFailedQuery: query,
          lastClientMessageId: messageId,
        });
      } finally {
        setStreamState((prev) => ({ ...prev, isStreaming: false }));
        abortControllerRef.current = null;
        activeConversationIdRef.current = null;
        currentQueryIdRef.current = null;
        useConversationStore.getState().setAbortStream(null);
      }
    },
    [
      apiEndpoint,
      onConversationCreated,
      onProgress,
      onErrorCallback,
      resetStreamState,
      addUserMessage,
      addAssistantMessage,
      updateLastMessage,
      createConversation,
      startQuery,
      addProgress,
      completeQuery,
    ],
  );

  const retry = useCallback(() => {
    if (streamState.lastFailedQuery && streamState.lastClientMessageId) {
      // Remove only the error assistant message (last message)
      const currentMessages = useConversationStore.getState().messages;
      const lastMsg = currentMessages[currentMessages.length - 1];

      // Only remove if last message is an assistant error message
      if (lastMsg && lastMsg.role === "assistant") {
        setMessages(currentMessages.slice(0, -1));
      }

      // Get current conversation ID
      const conversationId =
        useConversationStore.getState().currentConversationId;

      // Resend the message with the existing conversation ID and client message ID
      sendMessage({
        query: streamState.lastFailedQuery,
        conversationId: conversationId || undefined,
        isRetry: true,
        clientMessageId: streamState.lastClientMessageId,
      });
    }
  }, [
    streamState.lastFailedQuery,
    streamState.lastClientMessageId,
    setMessages,
    sendMessage,
  ]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    resetStreamState();
  }, [setMessages, resetStreamState]);

  const setMessagesDirectly = useCallback(
    (newMessages: Message[]) => {
      setMessages(newMessages);
    },
    [setMessages],
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
