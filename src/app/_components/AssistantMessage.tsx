"use client";

import { Separator } from "@/components/ui/separator";
import type { PaperSource } from "@/types/paper.type";
import { AssistantMessageContent } from "./AssistantMessageContent";
import { ReferencesList } from "./ReferencesList";

interface AssistantMessageProps {
  text: string;
  sources?: PaperSource[];
  showDivider?: boolean;
  isVisible?: boolean;
  isDone?: boolean;
}

export function AssistantResponse({
  text,
  sources,
  showDivider = false,
  isDone = false,
}: AssistantMessageProps) {
  return (
    <>
      <AssistantMessageContent text={text} sources={sources} isDone={isDone} />

      {sources && sources.length > 0 && <ReferencesList sources={sources} />}

      {showDivider && <Separator className="my-8" />}
    </>
  );
}
