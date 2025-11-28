"use client";

import { Separator } from "@/components/ui/separator";
import type { PaperSource } from "@/types/paper.type";
import { AnswerContent } from "./AnswerContent";
import { ReferencesList } from "./ReferencesList";

interface AssistantResponseProps {
  text: string;
  done?: boolean;
  streamBuffer?: string;
  sources?: PaperSource[];
  showDivider?: boolean;
}

export function AssistantResponse({ text, done, streamBuffer, sources, showDivider = false }: AssistantResponseProps) {
  return (
    <>
      <AnswerContent text={text} done={done} streamBuffer={streamBuffer} />
      
      {sources && sources.length > 0 && (
        <ReferencesList sources={sources} />
      )}

      {showDivider && (
        <Separator className="my-8" />
      )}
    </>
  );
}
