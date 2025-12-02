import { create } from "zustand";
import { Message } from "@/types/message.type";

interface ConversationState {
  // Current conversation
  currentConversationId: string | null;
  messages: Message[];
  isLoadingMessages: boolean;
  
  // Sidebar state
  isSidebarOpen: boolean;
  refreshTrigger: number;
  newConversationId: string | null; // Track newly created conversation for animation
  
  // Actions
  setCurrentConversationId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  setIsLoadingMessages: (isLoading: boolean) => void;
  toggleSidebar: () => void;
  incrementRefreshTrigger: () => void;
  setNewConversationId: (id: string | null) => void;
  clearConversation: () => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  // Initial state
  currentConversationId: null,
  messages: [],
  isLoadingMessages: false,
  isSidebarOpen: true,
  refreshTrigger: 0,
  newConversationId: null,

  // Actions
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  
  setMessages: (messages) => set({ messages }),
  
  setIsLoadingMessages: (isLoading) => set({ isLoadingMessages: isLoading }),
  
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  incrementRefreshTrigger: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
  
  setNewConversationId: (id) => set({ newConversationId: id }),
  
  clearConversation: () => set({
    currentConversationId: null,
    messages: [],
    isLoadingMessages: false,
  }),
}));
