"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import { Message } from "@/types/message.type";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Brand } from "@/components/global/brand";
import { MessageSection } from "./MessageSection";

interface MessageAreaProps {
  messages: Message[];
  progressSteps?: string[];
  progressSubtopics?: [string, string][];
  progressThoughts?: string[];
}

export function MessageArea({
  messages,
  progressSteps = [],
  progressSubtopics = [],
  progressThoughts = [],
}: MessageAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Track if user is near bottom of scroll
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      // If user scrolls up (not near bottom), stop auto-scrolling
      setIsUserScrolling(!isNearBottom);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll only if user hasn't scrolled up
  useEffect(() => {
    if (isUserScrolling) return;

    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isUserScrolling]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Empty>
          <EmptyHeader>
            <div className="flex flex-col items-center gap-4">
              <EmptyMedia>
                <Brand />
              </EmptyMedia>
              <div className="text-center space-y-2">
                <EmptyTitle className="text-2xl font-semibold">
                  Welcome to Exegent
                </EmptyTitle>
                <EmptyDescription className="text-base text-muted-foreground max-w-md">
                  Your AI-powered research assistant. Ask questions and get
                  evidence-based answers with citations from academic papers.
                </EmptyDescription>
              </div>
            </div>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 h-full">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {messages.map((m, i) => {
            const isUserMessage = m.role === "user";
            const showDivider = !isUserMessage && i < messages.length - 1;

            return (
              <MessageSection
                key={i}
                isUserMessage={isUserMessage}
                showDivider={showDivider}
                progressSteps={progressSteps}
                progressSubtopics={progressSubtopics}
                progressThoughts={progressThoughts}
                message={m}
              />
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
