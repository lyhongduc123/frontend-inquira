"use client";

import { useState } from "react";
import type { PaperSource } from "@/types/paper.type";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ArrowDownNarrowWide } from "lucide-react";
import { PaperCard } from "./PaperCard";

interface ReferencesListProps {
  sources: PaperSource[];
}

export function ReferencesList({ sources }: ReferencesListProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="mt-4 w-full">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-fit justify-between p-0 h-auto cursor-pointer group hover:bg-transparent"
          >
            <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground">
              References ({sources.length})
            </span>
            <ArrowDownNarrowWide className="h-4 w-4 ml-2 group-hover:text-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-2 mt-2">
            {sources.map((source, j) => (
              <PaperCard
                key={source.paper_id || j}
                title={source.title}
                authors={source.authors}
                year={source.year}
                venue={source.venue}
                abstract={source.abstract}
                url={source.pdf_url || source.url || ""}
                citation_count={source.citation_count}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
