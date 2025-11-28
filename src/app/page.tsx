"use client";

import { useState } from "react";
import { ChatMessages } from "./_components/ChatMessages";
import { ChatInput } from "./_components/ChatInput";
import { LeftSidebar } from "./_components/Sidebar";
import { streamAnswer } from "@/lib/stream";
import { Message } from "@/types/message.type";
import { Header } from "@/components/global/header";
import { Button } from "@/components/ui/button";
import { Sidebar } from "lucide-react";
import { cn } from "@/lib/utils";
import { conversationsApi } from "@/lib/conversations-api";

export default function ChatPage() {
  const [progressSteps, setProgressSteps] = useState<string[]>([]);
  const [progressSubtopics, setProgressSubtopics] = useState<
    [string, string][]
  >([]);
  const [progressThoughts, setProgressThoughts] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isError, setIsError] = useState(false);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  async function handleSend(query: string) {
    setIsError(false);
    setLastFailedQuery(null);

    // If there is already a user message, start a new chat (reset messages)
    setMessages((prev) => {
      const hasUserMessage = prev.some((msg) => msg.role === "user");
      if (hasUserMessage) {
        return [{ role: "user", text: query } as Message];
      }
      return [...prev, { role: "user", text: query } as Message];
    });
    setIsStreaming(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: "",
      } as Message,
    ]);

    try {
      await streamAnswer(
        "/api",
        { query, conversation_id: currentConversationId || undefined },
        {
          onConversation: (conversationId) => {
            console.log("Conversation ID:", conversationId);
            setCurrentConversationId(conversationId);
          },
          onSources: (sources) => {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              return [...prev.slice(0, -1), { ...last, sources }];
            });
            console.log("Received sources:", sources);
          },
          onChunk: (chunk) => {
            console.log("Received chunk:", chunk);
            setMessages((prev) => {
              const last = prev[prev.length - 1];

              return [
                ...prev.slice(0, -1),
                {
                  ...last,
                  streamBuffer: (last.streamBuffer ?? "") + chunk,
                },
              ];
            });
          },
          onEvent: (type, data) => {
            if (type === "step" && typeof data === "string") {
              setProgressSteps((prev) => [...prev, data]);
            }
            if (type === "thought" && typeof data === "string") {
              setProgressThoughts((prev) => [...prev, data]);
            }
            if (type === "subtopics" && Array.isArray(data)) {
              setProgressSubtopics(
                data.filter(
                  (item) =>
                    Array.isArray(item) &&
                    item.length === 2 &&
                    item.every((v) => typeof v === "string")
                )
              );
            }
          },
          onDone: () => {
            setMessages((prev) => {
              const last = prev[prev.length - 1];

              return [
                ...prev.slice(0, -1),
                {
                  ...last,
                  text: last.streamBuffer ?? "",
                  streamBuffer: undefined,
                  done: true,
                },
              ];
            });
          },
          onError: (error) => {
            console.error("Stream error:", error);
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              return [
                ...prev.slice(0, -1),
                { ...last, text: "Error: Failed to get response from server." },
              ];
            });
            setIsError(true);
            setLastFailedQuery(query);
          },
        }
      );
    } catch (error) {
      console.error("Streaming error:", error);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        return [
          ...prev.slice(0, -1),
          { ...last, text: "Error: Failed to get response from server." },
        ];
      });
      setIsError(true);
      setLastFailedQuery(query);
    } finally {
      setIsStreaming(false);
    }
  }

  function handleRetry() {
    if (lastFailedQuery) {
      setMessages((prev) => prev.slice(0, -2));
      handleSend(lastFailedQuery);
    }
  }

  async function handleSelectConversation(conversationId: string) {
    if (conversationId === currentConversationId) return;

    try {
      setIsLoadingMessages(true);
      setCurrentConversationId(conversationId);

      const conversation = await conversationsApi.get(conversationId);
      const loadedMessages: Message[] = conversation.messages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        text: msg.content,
        done: true,
        streamBuffer: undefined,
        sources: [...(msg.sources || [])],
      }));
      console.log("Loaded conversation messages:", loadedMessages);

      setMessages(loadedMessages);
      setIsError(false);
      setLastFailedQuery(null);
    } catch (error) {
      console.error("Failed to load conversation messages:", error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }

  function handleNewChat() {
    setCurrentConversationId(null);
    setMessages([]);
    setIsError(false);
    setLastFailedQuery(null);
    setProgressSteps([]);
    setProgressSubtopics([]);
    setProgressThoughts([]);
  }

  async function handleDeleteConversation(conversationId: string) {
    if (conversationId === currentConversationId) {
      handleNewChat();
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-row flex-1 overflow-hidden">
        <LeftSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDelete={handleDeleteConversation}
          currentConversationId={currentConversationId || undefined}
        />
        <div className="flex flex-col flex-1 h-full relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute left-4 top-4 z-10 min-h-8 min-w-8 h-8 w-8 rounded-full border border-border bg-background shadow-md hover:bg-muted"
          >
            <Sidebar
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                isSidebarOpen ? "" : "rotate-180"
              )}
            />
          </Button>
          {isLoadingMessages ? (
            // Loading state when fetching messages
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">
                  Loading messages...
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            // Centered layout for new conversation
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="w-full max-w-3xl space-y-6">
                <div className="text-center space-y-2 mb-8">
                  <h1 className="text-4xl font-bold">Welcome to Exegent</h1>
                  <p className="text-muted-foreground">
                    Your AI-powered research assistant. Ask questions and get
                    evidence-based answers with citations.
                  </p>
                </div>
                <ChatInput
                  onSend={handleSend}
                  isDisabled={isStreaming}
                  showRetry={isError && lastFailedQuery !== null}
                  onRetry={handleRetry}
                />
              </div>
            </div>
          ) : (
            // Normal layout for active conversation
            <>
              <div className="flex-1 overflow-y-auto">
                <ChatMessages
                  messages={messages}
                  progressSteps={progressSteps}
                  progressSubtopics={progressSubtopics}
                  progressThoughts={progressThoughts}
                />
              </div>
              <div className="border-t bg-background shrink-0">
                <div className="max-w-3xl mx-auto px-4">
                  <ChatInput
                    onSend={handleSend}
                    isDisabled={isStreaming}
                    showRetry={isError && lastFailedQuery !== null}
                    onRetry={handleRetry}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
