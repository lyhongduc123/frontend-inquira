"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { conversationsApi } from "@/lib/api/conversations-api";
import { Conversation } from "@/types/conversation.type";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EllipsisVerticalIcon } from "lucide-react";
import { TypographyP } from "@/components/global/typography";
import { Box } from "@/components/layout/box";

interface ConversationCardProps {
  currentConversationId: string;
  conversation: Conversation;
  onClick: () => void;
  onDelete?: (id: string) => void;
  isOpen?: boolean;
}

export function ConversationCard({
  currentConversationId,
  conversation,
  onClick,
  onDelete,
  isOpen,
}: ConversationCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "just now";
    
    const date = new Date(dateString);
    
    // Check if date is invalid
    if (isNaN(date.getTime())) {
      return "just now";
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  async function handleDeleteConversation(conversationId: string) {
    try {
      await conversationsApi.delete(conversationId);
      onDelete?.(conversationId);
    } catch (error) {
      console.error("Delete conversation error:", error);
      alert("Failed to delete conversation.");
    }
  }

  return (
    <div
      className={cn(
        "group flex items-center rounded-md p-3 hover:bg-muted cursor-pointer transition-opacity duration-300",
        currentConversationId === conversation.id && "bg-muted",
        typeof isOpen !== "undefined" && isOpen === false
          ? "opacity-0 pointer-events-none"
          : "opacity-100"
      )}
      onClick={onClick}
    >
      <Box className="flex-1 min-w-0 select-none p-0 bg-transparent">
        <TypographyP size="sm" weight="medium" leading="none" className="line-clamp-1">
          {conversation.title || "New Conversation"}
        </TypographyP>
        <TypographyP variant="muted" size="xs" leading="none">
          {formatDate(conversation.last_updated)}
          {/* {conversation.message_count} messages */}
        </TypographyP>
      </Box>
      <div
        className={cn(
          "transition-opacity duration-200 group-hover:opacity-100 opacity-0 flex pointer-events-auto"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <EllipsisVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={() => handleDeleteConversation(conversation.id)}
              >
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
