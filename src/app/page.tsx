"use client";

import { useEffect } from "react";
import { MessageArea } from "./_components/MessageArea";
import { ChatInput } from "./_components/ChatInput";
import { LeftSidebar } from "./_components/LeftSidebar";
import { Header } from "@/components/global/header";
import { Button } from "@/components/ui/button";
import { Sidebar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/use-chat";
import { useConversation } from "@/hooks/use-conversation";
import { useProgressTracking } from "@/hooks/use-progress-tracking";
import { useConversationStore } from "@/store/conversation-store";
import { useAuthStore } from "@/store/auth-store";
import { Message } from "@/types/message.type";

export default function ChatPage() {
  const isSidebarOpen = useConversationStore((state) => state.isSidebarOpen);
  const toggleSidebar = useConversationStore((state) => state.toggleSidebar);
  const refreshTrigger = useConversationStore((state) => state.refreshTrigger);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const {
    currentConversationId,
    isLoadingMessages,
    loadConversation,
    resetConversation,
    deleteConversation,
  } = useConversation();

  const { messages, isStreaming, sendMessage, clearMessages } = useChat({
    onConversationCreated: (conversationId: string) => {
      useConversationStore.getState().setCurrentConversationId(conversationId);
      useConversationStore.getState().incrementRefreshTrigger();
    },
  });

  const { progress, resetProgress } = useProgressTracking();

  const handleSend = async (query: string) => {
    await sendMessage(query, currentConversationId);
  };

  const handleSelectConversation = async (conversationId: string) => {
    await loadConversation(conversationId);
  };

  const handleNewConversation = () => {
    resetConversation();
    clearMessages();
    resetProgress();
  };

  const handleDeleteConversation = async (conversationId: string) => {
    const shouldReset = await deleteConversation(conversationId);
    if (shouldReset) {
      handleNewConversation();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-row flex-1 overflow-hidden">
        {!isAuthLoading && isAuthenticated && (
          <LeftSidebar
            isOpen={isSidebarOpen}
            onToggle={toggleSidebar}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            currentConversationId={currentConversationId || undefined}
            refreshTrigger={refreshTrigger}
          />
        )}
        <div className="flex flex-col flex-1 h-full relative">
          {!isAuthLoading && isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="absolute left-4 top-4 z-10 min-h-8 min-w-8 h-8 w-8 rounded-full border border-border bg-background shadow-md hover:bg-muted"
            >
              <Sidebar
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  isSidebarOpen ? "" : "rotate-180"
                )}
              />
            </Button>
          )}
          {isLoadingMessages ? (
            <LoadingState />
          ) : messages.length === 0 ? (
            <EmptyState onSend={handleSend} isDisabled={isStreaming} />
          ) : (
            <ChatView
              messages={messages}
              progress={progress}
              onSend={handleSend}
              isStreaming={isStreaming}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  onSend: (query: string) => void;
  isDisabled: boolean;
}

function EmptyState({ onSend, isDisabled }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to Exegent
          </h1>
          <p className="text-lg text-muted-foreground">
            Your AI-powered research assistant. Ask questions and get
            evidence-based answers with citations.
          </p>
        </div>
        <ChatInput onSend={onSend} isDisabled={isDisabled} isAtBottom={false} />
      </div>
    </div>
  );
}

interface ChatViewProps {
  messages: Message[];
  progress: {
    steps: string[];
    subtopics: [string, string][];
    thoughts: string[];
  };
  onSend: (query: string) => void;
  isStreaming: boolean;
}

function ChatView({ messages, progress, onSend, isStreaming }: ChatViewProps) {
  return (
    <>
      <div className="flex-1 overflow-y-hidden relative">
        <MessageArea
          messages={messages}
          progressSteps={progress.steps}
          progressSubtopics={progress.subtopics}
          progressThoughts={progress.thoughts}
        />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-background via-background/80 to-transparent" />
      </div>
      <div className="relative bg-transparent shrink-0 z-10">
        <ChatInput onSend={onSend} isDisabled={isStreaming} isAtBottom={true} />
      </div>
    </>
  );
}
