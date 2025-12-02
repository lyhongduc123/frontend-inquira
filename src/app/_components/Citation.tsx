"use client";

import React from "react";
import { PaperSource } from "@/types/paper.type";
import { CitationTrigger } from "./CitationTrigger";
import { CitationCard } from "./CitationCard";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useCitationPosition } from "@/hooks/use-citation-position";

interface CitationProps {
  number: string;
  paperId: string;
  source?: PaperSource;
}

export function Citation({ number, paperId, source }: CitationProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLSpanElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);
  const position = useCitationPosition(containerRef, open);

  if (!source) {
    return <span>[{number}]</span>;
  }

  return (
    <span
      ref={containerRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      <CitationTrigger
        paperDetail={source}
        number={Number(number)}
        isVisible={true}
        onClick={() => setOpen((v) => !v)}
      />
      {open && (
        <div
          ref={cardRef}
          style={{
            position: "fixed",
            zIndex: 9999,
            top: `${position.top}px`,
            left: `${position.left}px`,
            minWidth: 300,
            maxWidth: 400,
          }}
        >
          <CitationCard isVisible={true} paperDetail={source} />
          <button
            className="absolute top-1 right-2 w-5 h-5 flex items-center justify-center cursor-pointer text-xs bg-background border border-border rounded hover:bg-accent transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Close citation"
          >
            ×
          </button>
        </div>
      )}
    </span>
  );
}
