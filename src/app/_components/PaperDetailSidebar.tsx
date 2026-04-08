"use client";

import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { PaperDetailContent, PaperDetailFooter } from "./PaperDetailContent";
import type { PaperMetadata } from "@/types/paper.type";
import { HStack } from "@/components/layout/hstack";
import { useDetailSidebar } from "@/hooks/use-detail-sidebar";
import { Box } from "@/components/layout/box";
import { TypographyH3 } from "@/components/global/typography";
import { VStack } from "@/components/layout/vstack";
import { PaperCard } from "./PaperCard";

export function PaperDetailSidebar() {
  const {
    contentType,
    content,
    closeSidebar,
    referencePapers,
    openPaperFromReferenceList,
    goBackToReferences,
    canBackToReferences,
  } = useDetailSidebar();

  const paper = (
    contentType === "paper" ? content : null
  ) as PaperMetadata | null;

  return (
    <Sidebar
      side="right"
      collapsible="offcanvas"
      style={{ "--sidebar-width": "36rem" } as React.CSSProperties}
    >
      <SidebarHeader className="border-b px-4 py-2.5 bg-background">
        <HStack className="justify-between items-center">
          <HStack className="items-center gap-2">
            {contentType === "paper" && canBackToReferences ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={goBackToReferences}
                className="shrink-0"
                aria-label="Back to references"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : null}
            <TypographyH3 className="capitalize">{contentType}</TypographyH3>
          </HStack>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </HStack>
      </SidebarHeader>
      <SidebarContent className="p-4 bg-background overflow-hidden!">
        {contentType === "reference" ? (
          <VStack className="gap-2 overflow-auto">
            {referencePapers.map((source, idx) => (
              <PaperCard
                key={source.paperId || idx}
                idx={idx}
                paperMetadata={source}
                onView={openPaperFromReferenceList}
              />
            ))}
          </VStack>
        ) : paper ? (
          <PaperDetailContent paper={paper} />
        ) : null}
      </SidebarContent>
      <SidebarFooter className="border-t p-4 bg-background">
        {contentType === "paper" ? (
          <PaperDetailFooter paperMetadata={paper as PaperMetadata} />
        ) : (
          <Box />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
