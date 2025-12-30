"use client";

import { Separator } from "@/components/ui/separator";
import type { PaperSource } from "@/types/paper.type";
import { AssistantMessageBody } from "./AssistantMessageBody";
import { ReferencesList } from "./ReferencesList";

interface AssistantMessageProps {
  text: string;
  sources?: PaperSource[];
  showDivider?: boolean;
  isVisible?: boolean;
  isDone?: boolean;
}

export function AssistantMessage({
  text,
  sources,
  showDivider = false,
  isDone = false,
}: AssistantMessageProps) {
  return (
    <>
      <AssistantMessageBody text={text} sources={sources} isDone={isDone} />

      {sources && sources.length > 0 && <ReferencesList sources={sources} />}

      {showDivider && <Separator className="my-8" />}
    </>
  );
}
