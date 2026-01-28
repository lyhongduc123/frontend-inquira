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
            className="group h-auto w-fit cursor-pointer justify-between p-0 hover:bg-transparent"
          >
            <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground">
              References ({sources.length})
            </span>
            <ArrowDownNarrowWide className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:text-foreground group-data-[state=open]:rotate-180" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 space-y-2">
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
                sjr_data={source.sjr_data}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
