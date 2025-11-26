"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import { QuestionHeading } from "./QuestionHeading";
import { AssistantResponse } from "./AssistantResponse";
import { Message } from "@/types/message.type";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Brand } from "@/components/global/brand";

export function ChatMessages({ messages }: { messages: Message[] }) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <div className="flex flex-col items-center gap-2">
            <EmptyMedia>
              <Brand />
            </EmptyMedia>
            <EmptyTitle>Welcome to Exegent</EmptyTitle>
          </div>
          <EmptyDescription>
            Your AI-powered research assistant. Ask questions and get
            evidence-based answers with citations from academic papers.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 h-full">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-8">
          {messages.map((m, i) => {
            const isUserMessage = m.role === "user";
            const showDivider = !isUserMessage && i < messages.length - 1;

            return (
              <div key={i} className="w-full space-y-4">
                {isUserMessage ? (
                  <QuestionHeading text={m.text} />
                ) : (
                  <AssistantResponse
                    text={m.text}
                    sources={m.sources}
                    showDivider={showDivider}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
