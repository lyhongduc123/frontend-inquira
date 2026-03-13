"use client";

import type { PaperMetadata } from "@/types/paper.type";
import { HStack } from "@/components/layout/hstack";
import { VStack } from "@/components/layout/vstack";
import { TypographyP } from "@/components/global/typography";
import { useDetailSidebar } from "@/hooks/use-detail-sidebar";
import { cn } from "@/lib/utils";

interface ReferenceItemProps {
  reference: PaperMetadata;
  number: number;
}

/**
 * Individual reference item in the references list
 * Displays citation number and paper details in a compact format
 */
export function ReferenceItem({ reference, number }: ReferenceItemProps) {
  const { openPaper } = useDetailSidebar();
  const authors = reference.authors ?? [];
  
  const formatAuthors = () => {
    if (authors.length === 0) return "Unknown authors";
    if (authors.length === 1) return authors[0].name;
    if (authors.length === 2) return `${authors[0].name} and ${authors[1].name}`;
    return `${authors[0].name} et al.`;
  };

  const handleClick = () => {
    openPaper(reference);
  };

  return (
    <HStack 
      className={cn(
        "gap-3 items-start cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors min-w-0",
        "group"
      )}
      onClick={handleClick}
    >
      <TypographyP 
        weight="semibold" 
        className="text-xs text-muted-foreground shrink-0"
      >
        [{number}]
      </TypographyP>
      <VStack className="gap-1 flex-1 min-w-0">
        <TypographyP 
          className="text-sm group-hover:text-primary transition-colors line-clamp-2"
        >
          {reference.title}
        </TypographyP>
        <TypographyP 
          variant="muted" 
          size="xs"
          className="line-clamp-1"
        >
          {formatAuthors()}
          {reference.year && ` (${reference.year})`}
          {reference.venue && ` · ${reference.venue}`}
        </TypographyP>
      </VStack>
    </HStack>
  );
}
