"use client";

import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { LoadingDots } from "./LoadingDots";

interface AnswerContentProps {
  text: string;
}

export function AnswerContent({ text }: AnswerContentProps) {
  return (
    <div className="w-full">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {text ? (
          <MarkdownRenderer content={text} />
        ) : (
          <LoadingDots />
        )}
      </div>
    </div>
  );
}
