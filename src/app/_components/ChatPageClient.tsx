"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/app/_components/LoadingState";
import { EmptyState } from "@/app/_components/EmptyState";
import { ChatView } from "@/app/_components/ChatView";
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
import { SearchFilters } from "@/app/_components/FilterPanel";
import { PaperDetailSidebar } from "@/app/_components/PaperDetailSidebar";
import { QueryNavigator } from "@/app/_components/QueryNavigator";
import { useDetailSidebarStore } from "@/store/paper-detail-sidebar-store";
import { PaperMetadata } from "@/types/paper.type";

// Feature flag: Toggle between legacy and event-driven chat
const USE_EVENT_DRIVEN_CHAT = true;

interface ChatPageClientProps {
  routeConversationId?: string;
}

export function ChatPageClient({ routeConversationId }: ChatPageClientProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const showContent = !isAuthLoading && isAuthenticated;

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [selectedScopedPapers, setSelectedScopedPapers] = useState<
    PaperMetadata[]
  >([]);
  const [pipeline, setPipeline] = useState<"database" | "hybrid" | "standard">(
    "database",
  );
  const { isOpen: isDetailSidebarOpen, close: closeDetailSidebar } =
    useDetailSidebarStore();

  const {
    messageAreaRef,
    handleQueryClick,
    handleActiveQueryIndexChange,
  } = useViewMode();

  const {
    currentConversationId,
    isLoadingMessages,
    resetConversation,
    loadConversation,
  } = useConversation();

  const latestAppliedRouteConversationIdRef = useRef<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!showContent) return;

    if (routeConversationId) {
      if (
        latestAppliedRouteConversationIdRef.current !== routeConversationId
        || currentConversationId !== routeConversationId
      ) {
        latestAppliedRouteConversationIdRef.current = routeConversationId;
        void loadConversation(routeConversationId);
      }
      return;
    }

    latestAppliedRouteConversationIdRef.current = undefined;
    if (currentConversationId !== null) {
      resetConversation();
    }
  }, [
    currentConversationId,
    loadConversation,
    resetConversation,
    routeConversationId,
    showContent,
  ]);

  const onConversationCreated = useCallback(
    (conversationId: string) => {
      useConversationStore.getState().setCurrentConversationId(conversationId);
      useConversationStore.getState().incrementRefreshTrigger();
      router.push(`/conversation/${conversationId}`);
    },
    [router],
  );

  const legacyChat = useChat({ onConversationCreated });
  const eventDrivenChat = useEventDrivenChat({ onConversationCreated });
  const chatImpl = USE_EVENT_DRIVEN_CHAT ? eventDrivenChat : legacyChat;
  const { messages, isStreaming, sendMessage, clearMessages, retry } = chatImpl;

  const availablePapersMap = useMemo(() => {
    const map = new Map<string, PaperMetadata>();

    for (const message of messages) {
      const snapshots = Array.isArray(message.paperSnapshots)
        ? message.paperSnapshots
        : [];

      for (const paper of snapshots) {
        if (paper?.paperId) {
          map.set(paper.paperId, paper);
        }
      }
    }

    return map;
  }, [messages]);

  const toggleScopedPaper = useCallback(
    (paperId: string) => {
      const paper = availablePapersMap.get(paperId);
      if (!paper) return;

      setSelectedScopedPapers((prev) => {
        if (prev.some((p) => p.paperId === paperId)) {
          return prev.filter((p) => p.paperId !== paperId);
        }
        return [...prev, paper];
      });
    },
    [availablePapersMap],
  );

  const removeScopedPaper = useCallback((paperId: string) => {
    setSelectedScopedPapers((prev) => prev.filter((p) => p.paperId !== paperId));
  }, []);

  const { handleSend } = useChatHandlers({
    currentConversationId,
    sendMessage,
    resetConversation,
    clearMessages,
    searchFilters,
    selectedScopedPaperIds: selectedScopedPapers.map((paper) => paper.paperId),
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
              selectedScopedPapers={selectedScopedPapers}
              onRemoveScopedPaper={removeScopedPaper}
              pipeline={pipeline}
              onPipelineChange={setPipeline}
            />
          ) : (
            <ChatView
              conversationKey={routeConversationId ?? "new"}
              messages={messages}
              onSend={handleSend}
              isStreaming={isStreaming}
              onQueryClick={handleQueryClick}
              onActiveQueryIndexChange={handleActiveQueryIndexChange}
              messageAreaRef={messageAreaRef}
              filters={searchFilters}
              onFiltersChange={setSearchFilters}
              pipeline={pipeline}
              onPipelineChange={setPipeline}
              selectedScopedPapers={selectedScopedPapers}
              onToggleScopedPaper={toggleScopedPaper}
              onRemoveScopedPaper={removeScopedPaper}
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
