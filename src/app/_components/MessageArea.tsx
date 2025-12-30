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
import { ProgressState } from "@/hooks/use-progress-tracking";
import { QueryProgress } from "./QueryProgress";

interface MessageAreaProps {
  messages: Message[];
  progress: ProgressState;
  isStreaming: boolean;
}

export function MessageArea({
  messages,
  progress,
  isStreaming
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

  // Force scroll to bottom when new message is sent (user sends a message)
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsUserScrolling(false); // Re-enable auto-scroll
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (scrollContainer) {
          // Use smooth scroll for better UX
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: "smooth"
          });
        }
      }
    }
  }, [messages, messages.length]);

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
            // Show progress after the last user message (even if there's an assistant message after it)
            const nextMessage = messages[i + 1];
            const isLastUserMessageBeforeAssistant = isUserMessage && nextMessage?.role === "assistant" && i === messages.length - 2;
            const showProgress = isLastUserMessageBeforeAssistant && isStreaming && progress.currentPhase;

            return (
              <div key={i}>
                <MessageSection
                  isUserMessage={isUserMessage}
                  showDivider={showDivider}
                  progressSteps={progress.steps}
                  progressSubtopics={progress.subtopics}
                  progressThoughts={progress.thoughts.map(t => t.content)}
                  message={m}
                />
                {showProgress && (
                  <div className="mt-4">
                    <QueryProgress
                      currentPhase={progress.currentPhase}
                      phaseMessage={progress.phaseMessage}
                      progress={progress.progress}
                      thoughts={progress.thoughts}
                      analysisStats={progress.analysisStats}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
