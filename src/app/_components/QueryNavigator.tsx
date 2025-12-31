"use client";

import { Message } from "@/types/message.type";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueryNavigatorProps {
  messages: Message[];
  onQueryClick: (index: number) => void;
  activeQueryIndex?: number;
}

export function QueryNavigator({ messages, onQueryClick, activeQueryIndex }: QueryNavigatorProps) {
  // Filter only user messages
  const userQueries = messages
    .map((msg, idx) => ({ ...msg, originalIndex: idx }))
    .filter((msg) => msg.role === "user");

  if (userQueries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-sm text-muted-foreground">
        No queries yet
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r border-border bg-background">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold">Queries in this conversation</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {userQueries.length} {userQueries.length === 1 ? "query" : "queries"}
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {userQueries.map((query, idx) => (
            <Button
              key={query.originalIndex}
              variant={activeQueryIndex === query.originalIndex ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-left h-auto py-3 px-3",
                activeQueryIndex === query.originalIndex && "bg-secondary"
              )}
              onClick={() => onQueryClick(query.originalIndex)}
            >
              <div className="flex items-start gap-3 w-full">
                <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Query {idx + 1}</p>
                  <p className="text-sm line-clamp-2 break-all">
                    {query.text}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
