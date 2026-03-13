import { useCallback, useRef } from "react";
import { conversationsApi } from "@/lib/api/conversations-api";
import { Message } from "@/types/message.type";
import { useConversationStore } from "@/store/conversation-store";
import { Conversation } from "@/types/conversation.type";
import { PaperMetadata } from "@/types/paper.type";

export function useConversation() {
  const currentConversationId = useConversationStore(
    (state) => state.currentConversationId,
  );
  const isLoadingMessages = useConversationStore(
    (state) => state.isLoadingMessages,
  );
  const setCurrentConversationId = useConversationStore(
    (state) => state.setCurrentConversationId,
  );
  const setMessages = useConversationStore((state) => state.setMessages);
  const setIsLoadingMessages = useConversationStore(
    (state) => state.setIsLoadingMessages,
  );
  const clearConversation = useConversationStore(
    (state) => state.clearConversation,
  );
  const incrementRefreshTrigger = useConversationStore(
    (state) => state.incrementRefreshTrigger,
  );
  const setNewConversationId = useConversationStore(
    (state) => state.setNewConversationId,
  );

  const latestCreateRequestRef = useRef<number>(0);

  const createConversation = useCallback(
    async (title?: string): Promise<Conversation> => {
      const requestId = ++latestCreateRequestRef.current;
      const conversation = await conversationsApi.create({ title });

      // Only update state if this is still the latest request
      if (requestId === latestCreateRequestRef.current) {
        setCurrentConversationId(conversation.id);
        setNewConversationId(conversation.id);
        incrementRefreshTrigger();
      }

      return conversation;
    },
    [setCurrentConversationId, setNewConversationId, incrementRefreshTrigger],
  );

  const loadConversation = useCallback(
    async (conversationId: string): Promise<Message[]> => {
      if (conversationId === currentConversationId) {
        return [];
      }

      const { abortStream } = useConversationStore.getState();
      if (abortStream) {
        abortStream();
      }

      setIsLoadingMessages(true);
      setCurrentConversationId(conversationId);

      try {
        const conversation = await conversationsApi.get(conversationId);
        console.log("Loaded conversation:", conversation);
        const loadedMessages: Message[] = conversation.messages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          text: msg.content,
          done: true,
          paperSnapshots: [...(msg.paperSnapshots || [])] as PaperMetadata[],
          progressEvents: msg.progressEvents || undefined,
        }));

        setMessages(loadedMessages);
        return loadedMessages;
      } catch (error) {
        console.error("Failed to load conversation messages:", error);
        setMessages([]);
        return [];
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [
      currentConversationId,
      setCurrentConversationId,
      setIsLoadingMessages,
      setMessages,
    ],
  );

  const resetConversation = useCallback(() => {
    clearConversation();
  }, [clearConversation]);

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (conversationId === currentConversationId) {
        resetConversation();
        return true;
      }
      return false;
    },
    [currentConversationId, resetConversation],
  );

  return {
    currentConversationId,
    isLoadingMessages,
    loadConversation,
    resetConversation,
    deleteConversation,
    createConversation,
  };
}
