"use client";

import { LoadingDots } from "./LoadingDots";
import { StreamdownRender } from "@/app/_components/StreamdownRender";
import { PaperSource } from "@/types/paper.type";

interface AnswerContentProps {
  text: string;
  sources?: PaperSource[];
  isDone?: boolean;
}

export function AssistantMessageBody({
  text,
  sources,
  isDone = false,
}: AnswerContentProps) {
  return (
    <div className="w-full">
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {text ? (
          <StreamdownRender message={text} sources={sources} isStatic={isDone} />
        ) : (
          <LoadingDots />
        )}
      </div>
    </div>
  );
}
