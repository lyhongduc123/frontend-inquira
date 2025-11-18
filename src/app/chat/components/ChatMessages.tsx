/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { PaperCard } from "./PaperCard";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { LoadingDots } from "./LoadingDots";
import { useEffect, useRef } from "react";

 
export function ChatMessages({ messages }: { messages: any[] }) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);
  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Start a conversation</p>
      </div>
    );
  }
  
  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 h-full">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex w-full", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[85%] min-w-0", m.role === "user" ? "flex justify-end" : "flex justify-start")}>
                <Card className={cn(
                  "w-fit"
                )}>
                  <CardContent className="px-4 py-0">
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {m.text ? (
                          <MarkdownRenderer content={m.text} />
                        ) : (
                          <LoadingDots />
                        )}
                      </div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="m-0 wrap-break-word whitespace-pre-wrap leading-relaxed text-foreground">
                          {m.text}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {m.citations && (
                <div className="mt-3 w-full max-w-3xl">
                  <Separator className="mb-3" />
                  <div className="space-y-2">
                    {m.citations.map((c: any, j: number) => (
                      <PaperCard key={j} {...c} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
