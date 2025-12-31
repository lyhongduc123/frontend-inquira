"use client";

import { LeftSidebar } from "./_components/LeftSidebar";
import { LoadingState } from "./_components/LoadingState";
import { EmptyState } from "./_components/EmptyState";
import { ChatView } from "./_components/ChatView";
import { SidebarToggle } from "./_components/SidebarToggle";
import { Header } from "@/components/global/header";
import { useChat } from "@/hooks/use-chat";
import { useConversation } from "@/hooks/use-conversation";
import { useProgressTracking } from "@/hooks/use-progress-tracking";
import { useAuth } from "@/hooks/use-auth";
import { useViewMode } from "@/hooks/use-view-mode";
import { useChatHandlers } from "@/hooks/use-chat-handlers";
import { useConversationStore } from "@/store/conversation-store";

export default function ChatPage() {
  // Auth state
  const { showContent } = useAuth();
  
  // Sidebar state
  const sidebarState = useConversationStore((state) => ({
    isOpen: state.isSidebarOpen,
    toggle: state.toggleSidebar,
    refreshTrigger: state.refreshTrigger,
  }));
  
  // View mode and navigation
  const { viewMode, setViewMode, messageAreaRef, handleQueryClick } = useViewMode();
  
  // Conversation state
  const { 
    currentConversationId, 
    isLoadingMessages,
    loadConversation,
    resetConversation,
    deleteConversation,
  } = useConversation();
  
  // Progress tracking
  const { progress, handlePhase, handleThought, handleAnalysis, resetProgress } = useProgressTracking();
  
  // Chat state with callbacks
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
    handleDeleteConversation 
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
    <div className="flex flex-row h-screen">
      {/* Full-height sidebar */}
      {showContent && (
        <LeftSidebar
          isOpen={sidebarState.isOpen}
          onToggle={sidebarState.toggle}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          currentConversationId={currentConversationId || undefined}
          refreshTrigger={sidebarState.refreshTrigger}
        />
      )}
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Header */}
        {showContent && (
          <Header viewMode={viewMode} onViewModeChange={setViewMode} />
        )}
        
        {/* Chat content */}
        <div className="flex flex-col flex-1 overflow-hidden relative">
          {showContent && (
            <SidebarToggle isOpen={sidebarState.isOpen} onClick={sidebarState.toggle} />
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
              viewMode={viewMode}
              onQueryClick={handleQueryClick}
              messageAreaRef={messageAreaRef}
            />
          )}
        </div>
      </div>
    </div>
  );
}
