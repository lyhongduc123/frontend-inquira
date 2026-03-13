"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Conversation } from "@/types/conversation.type";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EllipsisVerticalIcon, Trash2 } from "lucide-react";
import { TypographyP } from "@/components/global/typography";
import { Box } from "@/components/layout/box";
import { HStack } from "@/components/layout/hstack";
import pluralize from "pluralize";
import { DeleteConversationDialog } from "./DeleteConversationDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface ConversationCardProps {
  currentConversationId: string;
  conversation: Conversation;
  onClick: () => void;
  onDelete?: (id: string) => Promise<void>;
  isOpen?: boolean;
}

export function ConversationCard({
  currentConversationId,
  conversation,
  onClick,
  onDelete,
  isOpen,
}: ConversationCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function handleDeleteConversation() {
    if (onDelete) {
      await onDelete(conversation.id);
    }
  }

  const userMsgcount = conversation.messageCount % 2 === 0 ? conversation.messageCount / 2 : Math.ceil(conversation.messageCount / 2);

  return (
    <>
      <HStack
        className={cn(
          "group/card relative items-center rounded-md gap-1 px-2 py-3 hover:bg-primary cursor-pointer transition-opacity duration-300",
          currentConversationId === conversation.id && "bg-primary",
          typeof isOpen !== "undefined" && isOpen === false
            ? "opacity-0 pointer-events-none"
            : "opacity-100",
        )}
        onClick={onClick}
      >
        <Box className="flex-1 min-w-0 select-none">
          <TypographyP
            size="sm"
            weight="medium"
            leading="none"
            className="truncate"
          >
            {conversation.title || "New Conversation"}
          </TypographyP>
          <TypographyP variant="muted" size="xs" leading="none">
            {userMsgcount} {" "}
            {pluralize("query", userMsgcount)}
          </TypographyP>
        </Box>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="icon"
              size="icon-sm"
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover/card:opacity-100 data-[state=open]:opacity-100 data-[state=open]:bg-white/10 transition-opacity duration-200"
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="start"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="select-none text-xs text-muted-foreground">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuItem>Archive</DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </HStack>
      <DeleteConversationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConversation}
        conversationTitle={`"${conversation.title || "New Conversation"}"`}
      />
    </>
  );
}


export function ConversationCardSkeleton({ isOpen }: { isOpen?: boolean }) {
  return (
    <HStack>
      <Box className="flex-1 min-w-0 animate-pulse gap-1">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </Box>
    </HStack>
  );
}