"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Message } from "@/types/message.type";
import { VStack } from "@/components/layout/vstack";
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

export interface MessageAreaRef {
  scrollToMessage: (index: number) => void;
}

interface MessageAreaProps {
  messages: Message[];
  progress: ProgressState;
  isStreaming: boolean;
}

export const MessageArea = forwardRef<MessageAreaRef, MessageAreaProps>(
  function MessageArea({ messages, progress, isStreaming }, ref) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);
    const messageRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Expose scrollToMessage function to parent
    useImperativeHandle(ref, () => ({
      scrollToMessage: (index: number) => {
        const messageElement = messageRefs.current[index];
        const scrollContainer = scrollAreaRef.current?.querySelector(
          "[data-radix-scroll-area-viewport]",
        ) as HTMLElement;

        if (messageElement && scrollContainer) {
          const offsetTop = messageElement.offsetTop;
          scrollContainer.scrollTo({
            top: offsetTop - 100, // 100px offset from top for better visibility
            behavior: "smooth",
          });
        }
      },
    }));

    useEffect(() => {
      const viewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement | null;

      if (!viewport) return;

      const onScroll = () => {
        const distance =
          viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;

        isAtBottomRef.current = distance < 100;
      };

      viewport.addEventListener("scroll", onScroll);
      return () => viewport.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
      const viewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement | null;

      if (!viewport) return;

      if (isStreaming && isAtBottomRef.current) {
        requestAnimationFrame(() => {
          viewport.scrollTop = viewport.scrollHeight;
        });
      }
    }, [messages, isStreaming]);

    useEffect(() => {
      const last = messages[messages.length - 1];
      if (last?.role !== "user") return;

      const viewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement | null;

      if (!viewport) return;

      requestAnimationFrame(() => {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      });
    }, [messages]);

    if (!messages || messages.length === 0) {
      return (
        <VStack className="flex-1 items-center justify-center p-8">
          <Empty>
            <EmptyHeader>
              <VStack className="items-center gap-4">
                <EmptyMedia>
                  <Brand />
                </EmptyMedia>
                <div className="space-y-2 text-center">
                  <EmptyTitle className="text-2xl font-semibold">
                    Welcome to Exegent
                  </EmptyTitle>
                  <EmptyDescription className="text-base text-muted-foreground max-w-md">
                    Your AI-powered research assistant. Ask questions and get
                    evidence-based answers with citations from academic papers.
                  </EmptyDescription>
                </div>
              </VStack>
            </EmptyHeader>
          </Empty>
        </VStack>
      );
    }

    return (
      <ScrollArea ref={scrollAreaRef} className="h-full flex-1">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="space-y-6">
            {messages.map((m, i) => {
              const isUserMessage = m.role === "user";
              const showDivider = !isUserMessage && i < messages.length - 1;
              const nextMessage = messages[i + 1];
              const isLastUserMessageBeforeAssistant =
                isUserMessage &&
                nextMessage?.role === "assistant" &&
                i === messages.length - 2;
              const showProgress =
                isLastUserMessageBeforeAssistant &&
                isStreaming &&
                progress.currentPhase;

              return (
                <div
                  key={i}
                  ref={(el) => {
                    messageRefs.current[i] = el;
                  }}
                >
                  <MessageSection
                    isUserMessage={isUserMessage}
                    showDivider={showDivider}
                    progressSteps={progress.steps}
                    progressSubtopics={progress.subtopics}
                    progressThoughts={progress.thoughts}
                    message={m}
                  />
                  {showProgress && (
                    <div className="mt-4">
                      <QueryProgress
                        isVisible={true}
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
  },
);
