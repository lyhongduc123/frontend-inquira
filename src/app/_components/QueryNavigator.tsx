"use client";

import { Message } from "@/types/message.type";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageCircleQuestionMark, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { TypographyH3, TypographyP } from "@/components/global/typography";
import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { Box } from "@/components/layout/box";

interface QueryNavigatorProps {
  messages: Message[];
  onQueryClick: (index: number) => void;
  activeQueryIndex?: number;
}

export function QueryNavigator({
  messages,
  onQueryClick,
  activeQueryIndex,
}: QueryNavigatorProps) {
  const userQueries = messages
    .map((msg, idx) => ({ ...msg, originalIndex: idx }))
    .filter((msg) => msg.role === "user");

  if (userQueries.length === 0) {
    return (
      <VStack className="items-center justify-center h-full p-4 text-sm text-muted-foreground">
        No queries yet
      </VStack>
    );
  }

  return (
    <VStack className="w-full h-full min-h-0 border-r bg-background gap-0">
      <VStack className="w-full border-b p-4">
        <TypographyH3 size="xs">Queries in this conversation</TypographyH3>
        <TypographyP variant="muted" size="xs" className="mt-1">
          {userQueries.length} {userQueries.length === 1 ? "query" : "queries"}
        </TypographyP>
      </VStack>
      <ScrollArea className="flex-1 min-h-0">
        <Box className="p-2 space-y-2 w-80">
          {userQueries.map((query, idx) => (
            <Button
              key={query.originalIndex}
              variant={
                activeQueryIndex === query.originalIndex ? "secondary" : "ghost"
              }
              className={cn(
                "h-auto w-full justify-start px-3 py-3 text-left whitespace-normal overflow-hidden",
                activeQueryIndex === query.originalIndex && "bg-secondary",
              )}
              onClick={() => onQueryClick(query.originalIndex)}
            >
              <HStack className="w-full items-start gap-3 min-w-0">
                <MessageCircleQuestionMark className="mt-0.5 h-4 w-4 shrink-0" />

                <VStack className="flex-1 min-w-0 gap-1">
                  <TypographyP size="sm" className="block truncate max-w-full">
                    {query.text}
                  </TypographyP>
                  <TypographyP size="xs" variant="muted" className="whitespace-nowrap">
                    Sources: 20
                  </TypographyP>
                </VStack>
              </HStack>
            </Button>
          ))}
        </Box>
      </ScrollArea>
    </VStack>
  );
}
