"use client";

import type { PaperMetadata } from "@/types/paper.type";
import { VStack } from "@/components/layout/vstack";
import { TypographyP } from "@/components/global/typography";
import { Separator } from "@/components/ui/separator";
import { ReferenceItem } from "./ReferenceItem";

interface ReferencesListProps {
  references: PaperMetadata[];
}

/**
 * Displays a list of references cited in the assistant message
 * Shows as a bibliography-style list at the end of the message
 */
export function ReferencesList({ references }: ReferencesListProps) {
  if (!references || references.length === 0) {
    return null;
  }

  return (
    <VStack className="mt-6 gap-3 min-w-0">
      <Separator className="my-2" />
      <TypographyP weight="semibold" className="text-sm">
        References
      </TypographyP>
      <VStack className="gap-3 min-w-0">
        {references.map((reference, index) => (
          <ReferenceItem
            key={reference.paperId || index}
            reference={reference}
            number={index + 1}
          />
        ))}
      </VStack>
    </VStack>
  );
}
