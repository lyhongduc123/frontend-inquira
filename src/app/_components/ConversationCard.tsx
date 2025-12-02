"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { conversationsApi } from "@/lib/conversations-api";
import { Conversation } from "@/types/conversation.type";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EllipsisVerticalIcon } from "lucide-react";

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
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

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
      <div className="flex-1 min-w-0 select-none">
        <p className="text-sm font-medium truncate text-foreground overflow-ellipsis">
          {conversation.title || "New Conversation"}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(conversation.last_updated)}
          {/* {conversation.message_count} messages */}
        </p>
      </div>
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
