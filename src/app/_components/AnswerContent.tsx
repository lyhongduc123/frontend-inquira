"use client";

import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { LoadingDots } from "./LoadingDots";
import { useEffect, useState } from "react";

interface AnswerContentProps {
  text: string; // final text (after streaming finishes)
  streamBuffer?: string; // current streaming content
  done?: boolean; // flag indicating streaming is finished
}

export function AnswerContent({
  text,
  streamBuffer,
  done,
}: AnswerContentProps) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (done) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayText(text);
    } else if (streamBuffer) {
      setDisplayText(streamBuffer);
    }
  }, [text, streamBuffer, done]);

  return (
    <div className="w-full">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {displayText ? (
          done ? (
            <MarkdownRenderer content={displayText} />
          ) : (
            <pre className="bg-muted p-2 rounded text-sm font-mono whitespace-pre-wrap break-words">
              {displayText}
            </pre>
          )
        ) : (
          <LoadingDots />
        )}
      </div>
    </div>
  );
}
