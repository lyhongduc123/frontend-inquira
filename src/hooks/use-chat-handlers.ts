import { useCallback } from "react";
import { Message } from "@/types/message.type";

interface ChatHandlersParams {
  currentConversationId: string | null;
  sendMessage: (query: string, conversationId?: string | null) => Promise<void>;
  loadConversation: (conversationId: string) => Promise<Message[]>;
  resetConversation: () => void;
  deleteConversation: (conversationId: string) => Promise<boolean>;
  clearMessages: () => void;
  resetProgress: () => void;
}

export function useChatHandlers({
  currentConversationId,
  sendMessage,
  loadConversation,
  resetConversation,
  deleteConversation,
  clearMessages,
  resetProgress,
}: ChatHandlersParams) {
  const handleNewConversation = useCallback(() => {
    resetConversation();
    clearMessages();
    resetProgress();
  }, [resetConversation, clearMessages, resetProgress]);
  
  const handleDeleteConversation = useCallback(async (conversationId: string) => {
    const shouldReset = await deleteConversation(conversationId);
    if (shouldReset) {
      handleNewConversation();
    }
  }, [deleteConversation, handleNewConversation]);
  
  const handleSend = useCallback(async (query: string) => {
    await sendMessage(query, currentConversationId);
  }, [sendMessage, currentConversationId]);
  
  const handleSelectConversation = useCallback(async (conversationId: string) => {
    await loadConversation(conversationId);
  }, [loadConversation]);
  
  return {
    handleSend,
    handleSelectConversation,
    handleNewConversation,
    handleDeleteConversation,
  };
}
