"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { SidebarButton } from "./LeftSidebarButton";
import { ModeToggle } from "./ThemeButton";
import { conversationsApi } from "@/lib/conversations-api";
import { ConversationCard } from "./ConversationCard";
import { motion, AnimatePresence } from "framer-motion";
import { Conversation } from "@/types/conversation.type";
import { useConversationStore } from "@/store/conversation-store";

interface LeftSidebarProps {
  className?: string;
  isOpen: boolean;
  onToggle?: () => void;
  onNewConversation?: () => void;
  onSelectConversation?: (conversationId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
  currentConversationId?: string;
  refreshTrigger?: number;
}

export function LeftSidebar({
  className,
  isOpen,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation: onDelete,
  currentConversationId,
  refreshTrigger,
}: LeftSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const newConversationId = useConversationStore((state) => state.newConversationId);
  const setNewConversationId = useConversationStore((state) => state.setNewConversationId);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await conversationsApi.list(1, 20, false);
      setConversations(response.conversations);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen, loadConversations]);

  // Handle new conversation animation
  useEffect(() => {
    if (newConversationId && isOpen) {
      // Fetch only the new conversation and prepend it
      const fetchNewConversation = async () => {
        try {
          const conversation = await conversationsApi.get(newConversationId);
          setConversations((prev) => {
            // Check if it already exists
            const exists = prev.some((c) => c.id === newConversationId);
            if (exists) return prev;
            // Prepend new conversation
            return [conversation, ...prev];
          });
          // Clear the flag after animation
          setTimeout(() => setNewConversationId(null), 500);
        } catch (error) {
          console.error("Failed to fetch new conversation:", error);
        }
      };
      fetchNewConversation();
    }
  }, [newConversationId, isOpen, setNewConversationId]);

  const handleNewConversation = async () => {
    if (onNewConversation) {
      onNewConversation();
      await loadConversations();
    }
  };

  const onDeleteConversation = async (conversationId: string) => {
    setConversations((prev) =>
      prev.filter((conv) => conv.id !== conversationId)
    );
    onDelete?.(conversationId);
  };

  return (
    <div
      className={cn(
        "relative h-full border-r border-border bg-background",
        className
      )}
    >
      {/* Sidebar Content */}
      <div
        className={cn(
          "flex h-full flex-col transition-all duration-300 ease-in-out",
          isOpen ? "w-80" : "w-16 overflow-hidden"
        )}
      >
        <div className="p-4">
          <SidebarButton
            isOpen={isOpen}
            onClick={handleNewConversation}
            text="New Chat"
          >
            <MessageSquare />
          </SidebarButton>
        </div>

        <ScrollArea className="flex-1 px-4 overflow-auto">
          {isOpen && (
            <div className="space-y-2">
              {loading ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Loading...
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No conversations yet
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {conversations.map((conversation) => {
                    const isNew = conversation.id === newConversationId;
                    return (
                      <motion.div
                        key={conversation.id}
                        layout
                        initial={isNew ? { opacity: 0, y: -20, scale: 0.95 } : false}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                        transition={{ 
                          duration: 0.3,
                          ease: "easeOut"
                        }}
                      >
                        <ConversationCard
                          currentConversationId={currentConversationId || ""}
                          conversation={conversation}
                          onClick={() => onSelectConversation?.(conversation.id)}
                          onDelete={onDeleteConversation}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          )}
        </ScrollArea>
        <div
          className={cn(
            "sticky bottom-0 p-4",
            !isOpen && "flex justify-center"
          )}
        >
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
