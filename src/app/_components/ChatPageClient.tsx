"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingState } from "@/app/_components/LoadingState";
import { EmptyState } from "@/app/_components/EmptyState";
import { ChatView } from "@/app/_components/ChatView";
import { Header } from "@/components/global/header";
import { useChat } from "@/hooks/use-chat";
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
import { consumeChatLaunchPayload, consumeScopedChatSelection } from "@/lib/scoped-chat-selection";

interface ChatPageClientProps {
  routeConversationId?: string;
}

export function ChatPageClient({ routeConversationId }: ChatPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const canRenderConversationRoute = Boolean(routeConversationId);
  const showContent = canRenderConversationRoute || (!isAuthLoading && isAuthenticated);
  const launchKeyFromQuery = searchParams.get("launch");

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [selectedScopedPapers, setSelectedScopedPapers] = useState<
    PaperMetadata[]
  >([]);
  const [pipeline, setPipeline] = useState<"database" | "hybrid">(
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
  const processedLaunchKeyRef = useRef<string | null>(null);

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
  }, [
    currentConversationId,
    loadConversation,
    routeConversationId,
    showContent,
  ]);

  useEffect(() => {
    if (!showContent) return;
    if (routeConversationId) return;
    if (launchKeyFromQuery) return;

    if (currentConversationId !== null) {
      resetConversation();
    }
  }, [
    currentConversationId,
    launchKeyFromQuery,
    resetConversation,
    routeConversationId,
    showContent,
  ]);

  useEffect(() => {
    const pendingScopedSelection = consumeScopedChatSelection();
    if (pendingScopedSelection.length === 0) return;

    queueMicrotask(() => {
      setSelectedScopedPapers((prev) => {
        const mergedMap = new Map<string, PaperMetadata>();

        for (const paper of prev) {
          mergedMap.set(paper.paperId, paper);
        }

        for (const paper of pendingScopedSelection) {
          if (paper?.paperId) {
            mergedMap.set(paper.paperId, paper);
          }
        }

        return Array.from(mergedMap.values());
      });
    });
  }, []);

  const onConversationCreated = useCallback(
    (conversationId: string) => {
      useConversationStore.getState().setCurrentConversationId(conversationId);
      router.push(`/conversation/${conversationId}`);
    },
    [router],
  );

  const { messages, isStreaming, sendMessage, clearMessages, retry } = useChat({
    onConversationCreated,
  });

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

  const clearScopedPapers = useCallback(() => {
    setSelectedScopedPapers([]);
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

  useEffect(() => {
    if (!showContent || routeConversationId) return;
    if (!launchKeyFromQuery) return;

    const consumedMarkerKey = `exegent_launch_consumed_${launchKeyFromQuery}`;
    if (sessionStorage.getItem(consumedMarkerKey) === "1") return;

    if (processedLaunchKeyRef.current === launchKeyFromQuery) return;

    processedLaunchKeyRef.current = launchKeyFromQuery;
    sessionStorage.setItem(consumedMarkerKey, "1");

    const launchPayload = consumeChatLaunchPayload(launchKeyFromQuery);
    if (!launchPayload) return;

    const scopedPapers = (launchPayload.scopedPapers || []).filter(
      (paper) => Boolean(paper?.paperId),
    );

    if (scopedPapers.length > 0) {
      queueMicrotask(() => {
        setSelectedScopedPapers((prev) => {
          const merged = new Map<string, PaperMetadata>();

          for (const paper of prev) merged.set(paper.paperId, paper);
          for (const paper of scopedPapers) merged.set(paper.paperId, paper);

          return Array.from(merged.values());
        });
      });
    }

    const pipelineFromLaunch = launchPayload.pipeline;
    if (pipelineFromLaunch) {
      queueMicrotask(() => {
        setPipeline(pipelineFromLaunch);
      });
    }

    const cleanedUrl = window.location.pathname;
    window.history.replaceState({}, "", cleanedUrl);

    const initialQuery = launchPayload.query.trim();
    if (!initialQuery) return;

    const requestFilters: Record<string, unknown> = {
      ...(launchPayload.filters || {}),
    };

    if (scopedPapers.length > 0) {
      requestFilters.paperIds = scopedPapers.map((paper) => paper.paperId);
    }

    void sendMessage({
      query: initialQuery,
      conversationId: launchPayload.conversationId || undefined,
      filters: Object.keys(requestFilters).length > 0 ? requestFilters : undefined,
      pipeline: launchPayload.pipeline || pipeline,
    });
  }, [
    launchKeyFromQuery,
    pipeline,
    routeConversationId,
    sendMessage,
    showContent,
  ]);

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
              onClearScopedPapers={clearScopedPapers}
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
              onClearScopedPapers={clearScopedPapers}
              onRetry={retry}
              isAuthenticated={isAuthenticated}
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
