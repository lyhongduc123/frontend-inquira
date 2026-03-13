"use client";

import React from "react";
import type { PaperMetadata } from "@/types/paper.type";
import { CitationTrigger } from "./CitationTrigger";
import { CitationCard } from "./CitationCard";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useCitationPosition } from "@/hooks/use-citation-position";
import { useDetailSidebar } from "@/hooks/use-detail-sidebar";
import { Box } from "@/components/layout/box";

interface CitationProps {
  number: string;
  paperId: string;
  source?: PaperMetadata;
}

export function Citation({
  number,
  source,
}: Omit<CitationProps, "paperId"> & { paperId?: string }) {
  const [showCard, setShowCard] = React.useState(false);
  const containerRef = React.useRef<HTMLSpanElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const { openPaper } = useDetailSidebar();

  useClickOutside(
    containerRef as React.RefObject<HTMLElement>,
    () => setShowCard(false),
    showCard,
  );
  const position = useCitationPosition(triggerRef, cardRef, showCard);

  if (!source) {
    return <span>[{number}]</span>;
  }

  const handleClick = () => {
    setShowCard(false);
    openPaper(source);
  };

  const handleMouseEnter = () => {
    setShowCard(true);
  };

  const handleMouseLeave = () => {
    setShowCard(false);
  };

  return (
    <span
      ref={containerRef}
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CitationTrigger
        ref={triggerRef}
        paperDetail={source}
        number={Number(number)}
        onClick={handleClick}
      />
      {showCard && (
        <Box
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
        </Box>
      )}
    </span>
  );
}
