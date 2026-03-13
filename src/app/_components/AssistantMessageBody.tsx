"use client";

import { StreamdownRender } from "@/app/_components/StreamdownRender";
import type { PaperMetadata } from "@/types/paper.type";

interface AnswerContentProps {
  text: string;
  sources?: PaperMetadata[];
  isDone?: boolean;
}

export function AssistantMessageBody({
  text,
  sources,
  isDone = false,
}: AnswerContentProps) {
  return (
    <div className="w-full grid grid-cols-1">
      <div className="prose prose-sm max-w-none dark:prose-invert wrap-break-word">
        <StreamdownRender message={text || ""} sources={sources} isStatic={isDone} />
      </div>
    </div>
  );
}
