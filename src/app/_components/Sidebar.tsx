"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { SidebarButton } from "./SidebarButton";
import { ModeToggle } from "./ThemeButton";
import { conversationsApi } from "@/lib/conversations-api";
import { ConversationCard } from "./ConversationCard";
import { motion, AnimatePresence } from "framer-motion";
import { Conversation } from "@/types/conversation.type";

interface LeftSidebarProps {
  className?: string;
  isOpen: boolean;
  onToggle?: () => void;
  onNewChat?: () => void;
  onSelectConversation?: (conversationId: string) => void;
  onDelete?: (conversationId: string) => void;
  currentConversationId?: string;
}

export function LeftSidebar({
  className,
  isOpen,
  onNewChat,
  onSelectConversation,
  onDelete,
  currentConversationId,
}: LeftSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await conversationsApi.list(1, 20, false); // Get non-archived
      setConversations(response.conversations);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    if (onNewChat) {
      onNewChat();
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
            onClick={handleNewChat}
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
                <AnimatePresence>
                  {conversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      layout="position"
                      initial={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ConversationCard
                        key={conversation.id}
                        currentConversationId={currentConversationId || ""}
                        conversation={conversation}
                        onClick={() => onSelectConversation?.(conversation.id)}
                        onDelete={onDeleteConversation}
                        // isOpen={isOpen}
                      />
                    </motion.div>
                  ))}
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
