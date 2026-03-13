"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
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
import { QueryProgress } from "./QueryProgress";
import { Box } from "@/components/layout/box";
import { useProgressStore } from "@/store/progress-store";
import { Separator } from "@/components/ui/separator";

export interface MessageAreaRef {
  scrollToMessage: (index: number) => void;
  scrollToLatestQuery: () => void;
  activeQueryIndex: number | null;
}

interface MessageAreaProps {
  messages: Message[];
  isStreaming: boolean;
  onRetry?: () => void;
}

export const MessageArea = forwardRef<MessageAreaRef, MessageAreaProps>(
  function MessageArea({ messages, isStreaming, onRetry }, ref) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);
    const messageRefs = useRef<(HTMLElement | null)[]>([]);
    const activeQueryId = useProgressStore((state) => state.activeQueryId);
    const [activeQueryIndex, setActiveQueryIndex] = useState<number | null>(
      null,
    );

    // Expose scrollToMessage function and activeQueryIndex to parent
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
      scrollToLatestQuery: () => {
        // Find the last user message
        const lastUserMessageIndex = messages
          .map((m, i) => (m.role === "user" ? i : -1))
          .filter((i) => i !== -1)
          .pop();

        if (lastUserMessageIndex !== undefined) {
          const messageElement = messageRefs.current[lastUserMessageIndex];
          const scrollContainer = scrollAreaRef.current?.querySelector(
            "[data-radix-scroll-area-viewport]",
          ) as HTMLElement;

          if (messageElement && scrollContainer) {
            const offsetTop = messageElement.offsetTop;
            scrollContainer.scrollTo({
              top: offsetTop - 100, // Position below header
              behavior: "smooth",
            });
          }
        }
      },
      activeQueryIndex,
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

      // Find the last user message index
      const lastUserMessageIndex = messages.length - 1;
      const messageElement = messageRefs.current[lastUserMessageIndex];

      if (messageElement) {
        requestAnimationFrame(() => {
          const offsetTop = messageElement.offsetTop;
          viewport.scrollTo({ 
            top: offsetTop - 100, // Position below header (100px offset)
            behavior: "smooth" 
          });
        });
      }
    }, [messages]);

    // Intersection observer to detect which query is currently in view
    useEffect(() => {
      const viewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement | null;

      if (!viewport || messages.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
              const index = messageRefs.current.indexOf(
                entry.target as HTMLElement,
              );
              if (index !== -1 && messages[index]?.role === "user") {
                setActiveQueryIndex(index);
              } 
            }
          });
        },
        {
          root: viewport,
          threshold: [0.5],
          rootMargin: "-20% 0px -70% 0px",
        },
      );

      // Observe all user message elements
      messageRefs.current.forEach((ref, index) => {
        if (ref && messages[index]?.role === "user") {
          observer.observe(ref);
        }
      });

      return () => observer.disconnect();
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
        <Box className="pb-32">
          {messages.map((m, i) => {
            const isUserMessage = m.role === "user";
            const nextMessage = messages[i + 1];
            const shouldShowProgress =
              isUserMessage && nextMessage?.role === "assistant";
            const shouldShowGradient = nextMessage?.role === "user";
            console.log("Message:", m);

            const messageQueryId =
              (m.metadata?.query_id as string | undefined) ||
              (i === messages.length - 2 ? activeQueryId : null);
            
            const hasStoredProgress = nextMessage?.progressEvents && nextMessage.progressEvents.length > 0;
            const progressData = hasStoredProgress ? {
              steps: nextMessage.progressEvents!,
              isComplete: true,
              // eslint-disable-next-line react-hooks/purity
              startedAt: nextMessage.progressEvents![0]?.timestamp || Date.now(),
              completedAt: nextMessage.progressEvents![nextMessage.progressEvents!.length - 1]?.timestamp,
              currentPhase: null,
            } : undefined;

            return (
              <Box key={i}>
                <Box
                  className="mx-auto max-w-4xl p-4 pb-6 min-w-0 overflow-hidden"
                  ref={(el) => {
                    messageRefs.current[i] = el;
                  }}
                >
                  <MessageSection 
                    isUserMessage={isUserMessage} 
                    message={m} 
                    onRetry={onRetry}
                  />
                  {shouldShowProgress && (
                    <Box className="mt-4">
                      <QueryProgress 
                        queryId={!hasStoredProgress ? messageQueryId : undefined} 
                        progressData={progressData}
                      />
                    </Box>
                  )}
                </Box>
                {shouldShowGradient && (
                  <Box className="relative w-full h-full">
                    <Box className="absolute inset-0 h-48 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
                    <Separator className="relative" />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </ScrollArea>
    );
  },
);
