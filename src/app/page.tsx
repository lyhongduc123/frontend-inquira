"use client";

import { LeftSidebar } from "./_components/LeftSidebar";
import { LoadingState } from "./_components/LoadingState";
import { EmptyState } from "./_components/EmptyState";
import { ChatView } from "./_components/ChatView";
import { Header } from "@/components/global/header";
import { useChat } from "@/hooks/use-chat";
import { useConversation } from "@/hooks/use-conversation";
import { useProgressTracking } from "@/hooks/use-progress-tracking";
import { useAuth } from "@/hooks/use-auth";
import { useViewMode } from "@/hooks/use-view-mode";
import { useChatHandlers } from "@/hooks/use-chat-handlers";
import { useConversationStore } from "@/store/conversation-store";
import { VStack } from "@/components/layout/vstack";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function ChatPage() {
  const { showContent } = useAuth();

  const { viewMode, setViewMode, messageAreaRef, handleQueryClick } =
    useViewMode();

  const {
    currentConversationId,
    isLoadingMessages,
    loadConversation,
    resetConversation,
    deleteConversation,
  } = useConversation();

  const {
    progress,
    handlePhase,
    handleThought,
    handleAnalysis,
    resetProgress,
  } = useProgressTracking();

  const { messages, isStreaming, sendMessage, clearMessages } = useChat({
    onConversationCreated: (conversationId: string) => {
      useConversationStore.getState().setCurrentConversationId(conversationId);
      useConversationStore.getState().incrementRefreshTrigger();
    },
    onPhase: handlePhase,
    onThought: handleThought,
    onAnalysis: handleAnalysis,
    onError: resetProgress,
  });

  // Event handlers
  const {
    handleSend,
    handleSelectConversation,
    handleNewConversation,
    handleDeleteConversation,
  } = useChatHandlers({
    currentConversationId,
    sendMessage,
    loadConversation,
    resetConversation,
    deleteConversation,
    clearMessages,
    resetProgress,
  });

  return (
    <SidebarProvider defaultOpen={true}>
      {/* Left Sidebar */}
      {showContent && (
        <LeftSidebar
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          currentConversationId={currentConversationId || undefined}
        />
      )}

      {/* Main content area */}
      <SidebarInset>
        <VStack className="h-screen overflow-hidden gap-0">
          <Header viewMode={viewMode} onViewModeChange={setViewMode}>
            {showContent && <SidebarTrigger className="mr-2" />}
          </Header>

          <VStack className="relative flex-1 overflow-hidden gap-0 transition-[width] duration-200">
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
                viewMode={viewMode}
                onQueryClick={handleQueryClick}
                messageAreaRef={messageAreaRef}
              />
            )}
          </VStack>
        </VStack>
      </SidebarInset>
    </SidebarProvider>
  );
}
