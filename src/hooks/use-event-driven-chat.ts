/**
 * Event-Driven Chat Hook (v2)
 * 
 * Uses the new event-driven architecture with task submission and resumable streaming.
 * 
 * Architecture:
 * 1. Submit task → POST /api/chat/submit → Get task_id
 * 2. Stream events → GET /api/chat/stream/{task_id}?from_sequence=N
 * 3. Page reload → Resume from last sequence number
 * 
 * Benefits:
 * - Pipeline continues running even if user reloads page
 * - Reconnectable with sequence tracking
 * - Non-blocking API
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Message } from "@/types/message.type";
import { useConversation } from "./use-conversation";
import { useConversationStore } from "@/store/conversation-store";
import { useAuthStore } from "@/store/auth-store";
import { useProgressStore } from "@/store/progress-store";
import { ProgressEvent } from "@/lib/stream/event.types";
import { chatApi } from "@/lib/api/chat-api";

interface UseEventDrivenChatOptions {
  onConversationCreated?: (conversationId: string) => void;
  onProgress?: (event: ProgressEvent) => void;
  onError?: () => void;
}

interface StreamState {
  isStreaming: boolean;
  isError: boolean;
  lastFailedQuery: string | null;
  activeTaskId: string | null;
  lastSequence: number;
}

interface TaskSubmitPayload {
  query: string;
  conversationId?: string;
  filters?: Record<string, unknown>;
  pipeline?: "database" | "hybrid" | "standard";
  clientMessageId?: string;
}

const ACTIVE_TASK_KEY = "exegent_active_task";
const TASK_SEQUENCE_KEY = "exegent_task_sequence";

export function useEventDrivenChat(options: UseEventDrivenChatOptions = {}) {
  const {
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
    activeTaskId: null,
    lastSequence: 0,
  });

  const accumulatedTextRef = useRef("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);
  const currentQueryIdRef = useRef<string | null>(null);

  // Restore active task on mount (for page reload)
  useEffect(() => {
    const savedTaskId = localStorage.getItem(ACTIVE_TASK_KEY);
    const savedSequence = localStorage.getItem(TASK_SEQUENCE_KEY);
    
    if (savedTaskId && savedSequence) {
      console.log(`Resuming task ${savedTaskId} from sequence ${savedSequence}`);
      // TODO: Implement resume logic
      // For now, clear it - we'll implement resume in next iteration
      localStorage.removeItem(ACTIVE_TASK_KEY);
      localStorage.removeItem(TASK_SEQUENCE_KEY);
    }
  }, []);

  const resetStreamState = useCallback(() => {
    setStreamState((prev) => ({
      ...prev,
      isError: false,
      lastFailedQuery: null,
    }));
  }, []);

  const addUserMessage = useCallback(
    (text: string, queryId: string, messageId: string) => {
      const currentMessages = useConversationStore.getState().messages;
      setMessages([
        ...currentMessages,
        {
          role: "user",
          text,
          metadata: { query_id: queryId, client_message_id: messageId },
        } as Message,
      ]);
    },
    [setMessages]
  );

  const addAssistantMessage = useCallback(() => {
    const currentMessages = useConversationStore.getState().messages;
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
        return;
      }

      const currentMessages = useConversationStore.getState().messages;
      const last = currentMessages[currentMessages.length - 1];
      setMessages([...currentMessages.slice(0, -1), { ...last, ...updates }]);
    },
    [setMessages]
  );

  /**
   * Stream events from a task (with reconnection support)
   */
  const streamTaskEvents = useCallback(
    async (taskId: string, fromSequence: number = 0) => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        throw new Error("Not authenticated");
      }

      abortControllerRef.current = new AbortController();
      
      // Store task for resume on page reload
      localStorage.setItem(ACTIVE_TASK_KEY, taskId);
      localStorage.setItem(TASK_SEQUENCE_KEY, fromSequence.toString());

      setStreamState((prev) => ({
        ...prev,
        isStreaming: true,
        activeTaskId: taskId,
        lastSequence: fromSequence,
      }));

      try {
        const url = chatApi.getEventDrivenStreamUrl(taskId, fromSequence);
        const response = await fetch(url, {
          credentials: "include",
          signal: abortControllerRef.current.signal,
          headers: {
            Accept: "text/event-stream",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let currentSequence = fromSequence;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let eventType = "";
          let eventData = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              eventData = line.slice(5).trim();
            } else if (line === "" && eventType && eventData) {
              // Process complete event
              try {
                let parsed: any;
                try {
                  parsed = JSON.parse(eventData);
                } catch {
                  parsed = { content: eventData };
                }
                currentSequence = parsed.sequence || currentSequence;
                
                // Update stored sequence
                localStorage.setItem(TASK_SEQUENCE_KEY, currentSequence.toString());
                setStreamState((prev) => ({
                  ...prev,
                  lastSequence: currentSequence,
                }));

                // Handle event types
                switch (eventType) {
                  case "step": // Progress update
                    if (currentQueryIdRef.current) {
                      const progressType = parsed.type || parsed.phase || "reasoning";
                      const progressEvent: ProgressEvent = {
                        type: progressType,
                        content: parsed.content || parsed.message || "",
                        metadata: parsed.metadata,
                      };
                      addProgress(currentQueryIdRef.current, progressEvent);
                      onProgress?.(progressEvent);
                    }
                    break;

                  case "metadata": // Paper metadata
                    if (parsed.papers) {
                      updateLastMessage({ paperSnapshots: parsed.papers });
                    }
                    break;

                  case "chunk": // Response text
                    if (parsed.content) {
                      accumulatedTextRef.current += parsed.content;
                      updateLastMessage({ text: accumulatedTextRef.current });
                    }
                    break;

                  case "reasoning": // LLM reasoning
                    // Optional: handle reasoning display
                    break;

                  case "done": // Completion
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
                    }
                    
                    // Clear stored task
                    localStorage.removeItem(ACTIVE_TASK_KEY);
                    localStorage.removeItem(TASK_SEQUENCE_KEY);
                    
                    setStreamState((prev) => ({
                      ...prev,
                      isStreaming: false,
                      activeTaskId: null,
                    }));
                    return; // Exit loop

                  case "error": // Error occurred
                    throw new Error(parsed.message || "Pipeline failed");

                  default:
                    console.warn("Unknown event type:", eventType, parsed);
                }
              } catch (parseError) {
                console.error("Failed to parse event data:", parseError);
              }

              // Reset for next event
              eventType = "";
              eventData = "";
            }
          }
        }
      } catch (error: unknown) {
        console.error("Stream error:", error);
        
        if (error instanceof Error && error.name !== "AbortError") {
          updateLastMessage({
            text: error.message || "Error: Failed to get response from server.",
            done: true,
            isError: true,
          });

          if (currentQueryIdRef.current) {
            completeQuery(currentQueryIdRef.current);
          }

          onErrorCallback?.();
          setStreamState((prev) => ({
            ...prev,
            isStreaming: false,
            isError: true,
          }));
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [updateLastMessage, addProgress, completeQuery, onProgress, onErrorCallback]
  );

  /**
   * Submit a new chat message
   */
  const sendMessage = useCallback(
    async (payload: TaskSubmitPayload) => {
      const {
        query,
        conversationId,
        filters,
        pipeline = "database",
        clientMessageId,
      } = payload;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      resetStreamState();

      // Generate IDs
      const messageId =
        clientMessageId ||
        `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const queryId = `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      currentQueryIdRef.current = queryId;

      // Initialize progress tracking
      startQuery(queryId, query, conversationId);

      // Add user message
      addUserMessage(query, queryId, messageId);

      const { isAuthenticated } = useAuthStore.getState();
      let finalConversationId = conversationId;

      // Create conversation if needed
      if (!finalConversationId && isAuthenticated) {
        try {
          const newConversation = await createConversation(query);
          finalConversationId = newConversation.id;
          
          if (finalConversationId) {
            onConversationCreated?.(finalConversationId);
            startQuery(queryId, query, finalConversationId);
          }
        } catch (error) {
          console.error("Error creating conversation:", error);
          throw error;
        }
      }

      // Track active conversation
      activeConversationIdRef.current = finalConversationId || null;

      // Add assistant message placeholder
      addAssistantMessage();

      try {
        // Submit task to backend
        const response = await fetch(chatApi.getEventDrivenSubmitUrl(), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            conversation_id: finalConversationId,
            filters,
            pipeline,
            client_message_id: messageId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to submit task: ${response.statusText}`);
        }

        const result = await response.json();
        const taskId = result?.data?.taskId ?? result?.data?.task_id;

        if (!taskId) {
          throw new Error("Missing task id from submit response");
        }

        console.log(`Task ${taskId} submitted, starting stream...`);

        // Stream events from task
        await streamTaskEvents(taskId, 0);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to submit message.";
        console.error("Send message error:", error);
        updateLastMessage({
          text: `Error: ${errorMessage}`,
          done: true,
          isError: true,
        });

        if (currentQueryIdRef.current) {
          completeQuery(currentQueryIdRef.current);
        }

        onErrorCallback?.();
        setStreamState((prev) => ({
          ...prev,
          isStreaming: false,
          isError: true,
          lastFailedQuery: query,
        }));
      } finally {
        activeConversationIdRef.current = null;
        currentQueryIdRef.current = null;
      }
    },
    [
      resetStreamState,
      startQuery,
      addUserMessage,
      addAssistantMessage,
      createConversation,
      onConversationCreated,
      streamTaskEvents,
      updateLastMessage,
      completeQuery,
      onErrorCallback,
    ]
  );

  const retry = useCallback(() => {
    if (streamState.lastFailedQuery) {
      // Remove error assistant message
      const currentMessages = useConversationStore.getState().messages;
      const lastMsg = currentMessages[currentMessages.length - 1];

      if (lastMsg && lastMsg.role === "assistant") {
        setMessages(currentMessages.slice(0, -1));
      }

      const conversationId =
        useConversationStore.getState().currentConversationId;

      sendMessage({
        query: streamState.lastFailedQuery,
        conversationId: conversationId || undefined,
      });
    }
  }, [streamState.lastFailedQuery, setMessages, sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    resetStreamState();
    
    // Clear any stored task
    localStorage.removeItem(ACTIVE_TASK_KEY);
    localStorage.removeItem(TASK_SEQUENCE_KEY);
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
    activeTaskId: streamState.activeTaskId,
    sendMessage,
    retry,
    clearMessages,
    setMessages: setMessagesDirectly,
  };
}
