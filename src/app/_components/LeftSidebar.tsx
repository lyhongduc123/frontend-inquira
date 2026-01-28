"use client";

import { MessageSquare } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LeftSidebarButton } from "./LeftSidebarButton";
import { ThemeButton } from "./ThemeButton";
import { conversationsApi } from "@/lib/api/conversations-api";
import { ConversationCard } from "./ConversationCard";
import { Conversation } from "@/types/conversation.type";
import { useConversationStore } from "@/store/conversation-store";
import { Brand } from "@/components/global/brand";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

interface LeftSidebarProps {
  onNewConversation?: () => void;
  onSelectConversation?: (conversationId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
  currentConversationId?: string;
}

export function LeftSidebar({
  onNewConversation,
  onSelectConversation,
  onDeleteConversation: onDelete,
  currentConversationId,
}: LeftSidebarProps) {
  const { open: isOpen } = useSidebar();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const newConversationId = useConversationStore(
    (state) => state.newConversationId
  );
  const setNewConversationId = useConversationStore(
    (state) => state.setNewConversationId
  );

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await conversationsApi.list(1, 20, false);
      setConversations(response.items);
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
      const fetchNewConversation = async () => {
        try {
          const conversationDetail = await conversationsApi.get(newConversationId);
          const conversation: Conversation = {
            id: conversationDetail.id,
            title: conversationDetail.title,
            message_count: conversationDetail.message_count,
            is_archived: conversationDetail.is_archived,
            last_updated: conversationDetail.updated_at,
          };
          setConversations((prev) => {
            const exists = prev.some((c) => c.id === newConversationId);
            if (exists) return prev;
            return [conversation, ...prev];
          });

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
    }
  };

  const onDeleteConversation = async (conversationId: string) => {
    setConversations((prev) =>
      prev.filter((conv) => conv.id !== conversationId)
    );
    onDelete?.(conversationId);
  };

  return (
    <Sidebar collapsible="icon" side="left">
      {/* Header with Brand */}
      <SidebarHeader className="py-4">
        <Brand showText={isOpen} />
      </SidebarHeader>

      {/* New Chat Button */}
      <div className="p-2">
        <LeftSidebarButton
          isOpen={isOpen}
          onClick={handleNewConversation}
          text="New Chat"
        >
          <MessageSquare />
        </LeftSidebarButton>
      </div>

      {/* Conversations List */}
      <SidebarContent className="px-2">
        {isOpen && (
          <div className="space-y-2">
            {loading ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
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
                      initial={
                        isNew ? { opacity: 0, y: -20, scale: 0.95 } : false
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -20, scale: 0.95 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                    >
                      <ConversationCard
                        currentConversationId={currentConversationId || ""}
                        conversation={conversation}
                        onClick={() =>
                          onSelectConversation?.(conversation.id)
                        }
                        onDelete={onDeleteConversation}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        )}
      </SidebarContent>

      {/* Footer with Theme Button */}
      <SidebarFooter>
        <ThemeButton />
      </SidebarFooter>
    </Sidebar>
  );
}
