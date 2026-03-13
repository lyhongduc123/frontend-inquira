"use client";

import { BookmarkIcon, MessageSquarePlus } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { LeftSidebarMenuButton } from "./LeftSidebarMenuButton";
import { conversationsApi } from "@/lib/api/conversations-api";
import { ConversationCard, ConversationCardSkeleton } from "./ConversationCard";
import { useConversationStore } from "@/store/conversation-store";
import { useAuthStore } from "@/store/auth-store";
import { Brand } from "@/components/global/brand";
import { SidebarUserMenu } from "@/components/auth/sidebar-user-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarManagerTrigger,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Box } from "@/components/layout/box";
import { useConversations } from "@/hooks/use-conversations";
import { VStack } from "@/components/layout/vstack";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useConversation } from "@/hooks/use-conversation";

export function LeftSidebar() {
  const router = useRouter();
  const { open: isOpen } = useSidebar();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    currentConversationId,
    loadConversation,
    resetConversation,
    deleteConversation: deleteConversationAction,
  } = useConversation();

  const newConversationId = useConversationStore(
    (state) => state.newConversationId,
  );
  const setNewConversationId = useConversationStore(
    (state) => state.setNewConversationId,
  );

  const {
    conversations,
    isLoading,
    addConversationOptimistically,
    deleteConversation,
  } = useConversations({
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (newConversationId) {
      const fetchNewConversation = async () => {
        try {
          const conversationDetail =
            await conversationsApi.get(newConversationId);

          addConversationOptimistically(conversationDetail);
          setTimeout(() => setNewConversationId(null), 500);
        } catch (error) {
          console.error("Failed to fetch new conversation:", error);
        }
      };
      fetchNewConversation();
    }
  }, [newConversationId, setNewConversationId, addConversationOptimistically]);

  const handleNewConversation = () => {
    resetConversation();
    router.push("/");
  };

  const handleSelectConversation = async (conversationId: string) => {
    await loadConversation(conversationId);
    router.push("/");
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await new Promise<void>((resolve, reject) => {
        deleteConversation(conversationId, {
          onSuccess: async () => {
            toast.success("Conversation deleted successfully");
            // If deleting current conversation, navigate to home
            if (conversationId === currentConversationId) {
              await deleteConversationAction(conversationId);
              handleNewConversation();
            }
            resolve();
          },
          onError: (error) => {
            console.error("Delete conversation error:", error);
            toast.error("Failed to delete conversation. Please try again.");
            reject(error);
          },
        });
      });
    } catch (error) {
      throw error;
    }
  };

  return (
    <Sidebar collapsible="icon" side="left">
      {isAuthenticated && (
        <SidebarManagerTrigger
          name="left"
          variant={"default"}
          className={cn(
            "absolute top-3 -right-4 z-10 rounded-full p-1 ",
            !isOpen ? "-right-10" : "-right-4",
          )}
        ></SidebarManagerTrigger>
      )}
      <SidebarHeader className="py-4">
        <Brand showText={isOpen} />
        <SidebarMenu>
          <LeftSidebarMenuButton
            isOpen={isOpen}
            onClick={handleNewConversation}
            text="New Chat"
          >
            <MessageSquarePlus />
          </LeftSidebarMenuButton>
          <LeftSidebarMenuButton
            isOpen={isOpen}
            onClick={() => {
              resetConversation();
              router.push("/bookmarks");
            }}
            text="Bookmarks"
          >
            <BookmarkIcon />
          </LeftSidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        {isOpen && (
          <SidebarGroup className="w-full min-w-0 gap-1">
            <SidebarGroupLabel className="select-none">
              Your conversations
            </SidebarGroupLabel>
            {!isAuthenticated ? (
              <Box className="py-4 px-2 text-center text-sm text-muted-foreground">
                Log in to save your history and customize your experience
              </Box>
            ) : isLoading ? (
              <Box>
                {Array.from({ length: 5 }).map((_, i) => (
                  <ConversationCardSkeleton key={i} />
                ))}
              </Box>
            ) : conversations.length === 0 ? (
              <Box className="py-4 text-center text-sm text-muted-foreground">
                No conversations yet
              </Box>
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
                        key={conversation.id}
                        currentConversationId={currentConversationId || ""}
                        conversation={conversation}
                        onClick={() =>
                          handleSelectConversation(conversation.id)
                        }
                        onDelete={handleDeleteConversation}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        {isAuthenticated ? (
          <SidebarUserMenu />
        ) : (
          <VStack className="w-full gap-2">
            <SidebarMenuButton className="bg-primary text-primary-foreground items-center justify-center cursor-pointer">
              Sign Up
            </SidebarMenuButton>
            <Link href="/login">
              <SidebarMenuButton
                variant={"outline"}
                className="bg-inherit items-center justify-center cursor-pointer border border-primary"
              >
                Sign In
              </SidebarMenuButton>
            </Link>
          </VStack>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
