"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MessageSquare, Sidebar } from "lucide-react";
import { useState } from "react";
import { SidebarButton } from "./SidebarButton";
import { ModeToggle } from "./ThemeButton";

interface LeftSidebarProps {
  className?: string;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
}

export function LeftSidebar({ className }: LeftSidebarProps) {
  const [conversations] = useState<Conversation[]>([
    { id: "1", title: "AI Research Discussion", timestamp: new Date() },
    { id: "2", title: "Machine Learning Paper Review", timestamp: new Date() },
    { id: "3", title: "Data Analysis Questions", timestamp: new Date() },
  ]);
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={cn("relative h-full border-r border-border bg-background", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-4 z-10 min-h-8 min-w-8 h-8 w-8 rounded-full border border-border bg-background shadow-md hover:bg-muted"
      >
        <Sidebar className={cn("h-4 w-4", isOpen ? "rotate-180" : "")} />
      </Button>

      {/* Sidebar Content */}
      <div
        className={cn(
          "flex h-full flex-col transition-all duration-300 ease-in-out",
          isOpen ? "w-80" : "w-16 overflow-hidden"
        )}
      >
        <div className="p-4">
          {/* <h3 className="text-lg font-semibold mb-4 text-foreground">Chat History</h3> */}
          <SidebarButton isOpen={isOpen} onClick={() => {}} text="New Chat">
            <MessageSquare />
          </SidebarButton>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-center rounded-md p-3 hover:bg-muted cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0 select-none">
                  <p className="text-sm font-medium truncate text-foreground">
                    {conversation.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {conversation.timestamp.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="sticky bottom-0 p-4">
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
