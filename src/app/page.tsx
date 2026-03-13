"use client";

import { useState } from "react";
import { LoadingState } from "./_components/LoadingState";
import { EmptyState } from "./_components/EmptyState";
import { ChatView } from "./_components/ChatView";
import { Header } from "@/components/global/header";
import { useChat } from "@/hooks/use-chat";
import { useEventDrivenChat } from "@/hooks/use-event-driven-chat";
import { useConversation } from "@/hooks/use-conversation";
import { useAuthStore } from "@/store/auth-store";
import { useViewMode } from "@/hooks/use-view-mode";
import { useChatHandlers } from "@/hooks/use-chat-handlers";
import { useConversationStore } from "@/store/conversation-store";
import { VStack } from "@/components/layout/vstack";
import {
  SidebarProvider,
  SidebarInset,
  SidebarManager,
} from "@/components/ui/sidebar";
import { SearchFilters } from "./_components/FilterPanel";
import { PaperDetailSidebar } from "./_components/PaperDetailSidebar";
import { QueryNavigator } from "./_components/QueryNavigator";
import { useDetailSidebarStore } from "@/store/paper-detail-sidebar-store";

// Feature flag: Toggle between legacy and event-driven chat
const USE_EVENT_DRIVEN_CHAT = true;

export default function ChatPage() {
  return <ChatPageContent />;
}

function ChatPageContent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const showContent = !isAuthLoading && isAuthenticated;
  
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [pipeline, setPipeline] = useState<"database" | "hybrid" | "standard">(
    "database",
  );
  const { isOpen: isDetailSidebarOpen, close: closeDetailSidebar } =
    useDetailSidebarStore();

  const { messageAreaRef, handleQueryClick, activeQueryIndex } = useViewMode();

  const {
    currentConversationId,
    isLoadingMessages,
    resetConversation,
  } = useConversation();

  // Choose between legacy and event-driven chat
  const legacyChat = useChat({
    onConversationCreated: (conversationId: string) => {
      useConversationStore.getState().setCurrentConversationId(conversationId);
      useConversationStore.getState().incrementRefreshTrigger();
    },
  });

  const eventDrivenChat = useEventDrivenChat({
    onConversationCreated: (conversationId: string) => {
      useConversationStore.getState().setCurrentConversationId(conversationId);
      useConversationStore.getState().incrementRefreshTrigger();
    },
  });

  // Select the active chat implementation
  const chatImpl = USE_EVENT_DRIVEN_CHAT ? eventDrivenChat : legacyChat;
  const { messages, isStreaming, sendMessage, clearMessages, retry } = chatImpl;

  // Event handlers
  const { handleSend } = useChatHandlers({
    currentConversationId,
    sendMessage,
    resetConversation,
    clearMessages,
    searchFilters,
    pipeline,
  });

  return (
    <SidebarProvider
      open={isDetailSidebarOpen}
      onOpenChange={(open) => {
        if (!open) closeDetailSidebar();
      }}
      style={
        {
          "--sidebar-width": "36rem",
        } as React.CSSProperties
      }
    >
      <SidebarInset>
        {showContent && messages.length > 0 && (
          <Header
            middleContent={
              <QueryNavigator
                messages={messages}
                onQueryClick={handleQueryClick}
                activeQueryIndex={activeQueryIndex ?? undefined}
              />
            }
          ></Header>
        )}
        <VStack className="relative flex-1 overflow-hidden gap-0 min-w-0">
          {isLoadingMessages ? (
            <LoadingState />
          ) : messages.length === 0 ? (
            <EmptyState
              onSend={handleSend}
              isDisabled={isStreaming}
              filters={searchFilters}
              onFiltersChange={setSearchFilters}
              pipeline={pipeline}
              onPipelineChange={setPipeline}
            />
          ) : (
            <ChatView
              messages={messages}
              onSend={handleSend}
              isStreaming={isStreaming}
              onQueryClick={handleQueryClick}
              messageAreaRef={messageAreaRef}
              filters={searchFilters}
              onFiltersChange={setSearchFilters}
              pipeline={pipeline}
              onPipelineChange={setPipeline}
              activeQueryIndex={activeQueryIndex ?? undefined}
              onRetry={retry}
            />
          )}
        </VStack>
      </SidebarInset>
      <SidebarManager name="right">
        <PaperDetailSidebar />
      </SidebarManager>
    </SidebarProvider>
  );
}
