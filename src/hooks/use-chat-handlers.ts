import { useCallback } from "react";
import { SearchFilters } from "@/app/_components/FilterPanel";
import { transformFiltersForBackend } from "@/lib/filter-utils";
import { ChatSendMessagePayload } from "@/types/chat.type";

interface ChatHandlersParams {
  currentConversationId: string | null;
  sendMessage: (payload: ChatSendMessagePayload) => Promise<void>;
  resetConversation: () => void;
  clearMessages: () => void;
  searchFilters?: SearchFilters;
  selectedScopedPaperIds?: string[];
  pipeline?: "research" | "agent";
  // Deprecated - kept for backward compatibility
  useHybridPipeline?: boolean;
}

/**
 * Hook for creating chat message handlers without navigation logic.
 * Components using these handlers should handle navigation themselves.
 */
export function useChatHandlers({
  currentConversationId,
  sendMessage,
  resetConversation,
  clearMessages,
  searchFilters,
  selectedScopedPaperIds = [],
  pipeline = "research",
  useHybridPipeline,
}: ChatHandlersParams) {
  
  const handleNewConversation = useCallback(() => {
    resetConversation();
    clearMessages();
  }, [resetConversation, clearMessages]);
  
  const handleSend = useCallback(async (query: string) => {
    const transformedFilters = transformFiltersForBackend(searchFilters) || {};

    if (selectedScopedPaperIds.length > 0) {
      transformedFilters.paperIds = selectedScopedPaperIds;
    }
    
    await sendMessage({ 
      query, 
      conversationId: currentConversationId || undefined,
      filters: Object.keys(transformedFilters).length > 0 ? transformedFilters : undefined,
      pipeline: pipeline,
      useHybridPipeline: useHybridPipeline,
    } as ChatSendMessagePayload);
  }, [sendMessage, currentConversationId, searchFilters, selectedScopedPaperIds, pipeline, useHybridPipeline]);
  
  return {
    handleSend,
    handleNewConversation,
  };
}
