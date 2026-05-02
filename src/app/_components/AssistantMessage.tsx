"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ChevronRight,
  ClipboardIcon,
  ClipboardPasteIcon,
} from "lucide-react";
import type { PaperMetadata } from "@/types/paper.type";
import type { ScopedCitationRef } from "@/lib/scoped-citation-utils";
import { AssistantMessageBody } from "./AssistantMessageBody";
import { Box } from "@/components/layout/box";
import { VStack } from "@/components/layout/vstack";
import { useDetailSidebar } from "@/hooks/use-detail-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { ChevronRightIcon } from "lucide-react";
import { getCitedPapers, getFormattedCitedContent } from "@/lib/citation-utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PaperCard } from "./PaperCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CITED_ONLY_STORAGE_KEY } from "@/core";
import { HStack } from "@/components/layout/hstack";
import ExportButton from "./_shared/ExportButton";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useScopedPaperSelection } from "@/hooks/use-scoped-paper-selection";

interface AssistantMessageProps {
  text: string;
  sources?: PaperMetadata[];
  scopedQuoteRefs?: ScopedCitationRef[];
  showDivider?: boolean;
  isVisible?: boolean;
  isDone?: boolean;
  isError?: boolean;
  isAnalyzing?: boolean;
}

export function AssistantMessage({
  text,
  sources,
  scopedQuoteRefs,
  showDivider = false,
  isDone = false,
  isError = false,
  isAnalyzing = false,
}: AssistantMessageProps) {
  const { openPaper, closeSidebar, content, contentType } = useDetailSidebar();
  const {
    selectedScopedPaperIds,
    toggleScopedPaper,
  } = useScopedPaperSelection();

  const handleOpenPaper = (paper: PaperMetadata) => {
    const isSamePaperOpen =
      !!content && contentType === "paper" && content.paperId === paper.paperId;

    if (isSamePaperOpen) {
      closeSidebar();
      return;
    }

    openPaper(paper);
  };

  return (
    <Box className="min-w-0">
      {isAnalyzing && !text ? (
        <VStack className="space-y-2 animate-pulse pr-12 pb-4">
          <Box className="h-4 bg-muted rounded-sm w-full" />
          <Box className="h-4 bg-muted rounded-sm w-[90%]" />
          <Box className="h-4 bg-muted rounded-sm w-[40%]" />
          <Box className="mt-2 text-xs text-muted-foreground italic">
            Analyzing research papers...
          </Box>
        </VStack>
      ) : (
        <AssistantMessageBody
          text={text}
          sources={sources}
          scopedQuoteRefs={scopedQuoteRefs}
          isDone={isDone}
        />
      )}

      {isError && (
        <Box className="mt-4">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              Something wrong happened, please try again
            </AlertDescription>
          </Alert>
        </Box>
      )}

      {Array.isArray(sources) && sources.length > 0 && (
        <HStack className="w-full mt-4">
          <MessageBottomBar
            text={text}
            sources={sources}
            selectedPaperIds={selectedScopedPaperIds}
            onTogglePaperSelection={(paper) => {
              if (paper.paperId) {
                toggleScopedPaper(paper.paperId);
              }
            }}
            onViewPaper={handleOpenPaper}
            viewingPaperId={
              contentType === "paper" && content ? content.paperId : undefined
            }
          />
        </HStack>
      )}

      {showDivider && <Separator className="my-8" />}
    </Box>
  );
}

interface ExportDropdownProps {
  text: string;
  papers: PaperMetadata[];
  cited_papers: PaperMetadata[];
}

const ExportDropdown = ({
  text,
  cited_papers,
  papers,
}: ExportDropdownProps) => {
  const handleCopyText = () => {
    const formattedText = getFormattedCitedContent(text, cited_papers);
    navigator.clipboard.writeText(formattedText);
    toast.success("Copied to clipboard!", {
      position: "top-center",
    });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <ClipboardIcon className="size-4" />
          <ChevronRight className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right">
        <DropdownMenuItem
          onClick={handleCopyText}
          className="dark:focus:bg-accent/10 focus:bg-primary/10 focus:text-primary"
        >
          <ClipboardPasteIcon className="size-4" />
          Copy text
        </DropdownMenuItem>

        <ExportButton variant={"ghost"} sources={papers} asChild>
          <DropdownMenuItem className="dark:focus:bg-accent/10 focus:bg-primary/10 focus:text-primary">
            <ClipboardPasteIcon className="size-4" />
            Export to CSV
          </DropdownMenuItem>
        </ExportButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface MessageBottomBarProps {
  text: string;
  sources: PaperMetadata[];
  selectedPaperIds?: string[];
  onTogglePaperSelection?: (paper: PaperMetadata) => void;
  onViewPaper: (paper: PaperMetadata) => void;
  viewingPaperId?: string;
}

function MessageBottomBar({
  text,
  sources,
  selectedPaperIds = [],
  onTogglePaperSelection,
  onViewPaper,
  viewingPaperId,
}: MessageBottomBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCitedOnly, setShowCitedOnly] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(CITED_ONLY_STORAGE_KEY) === "1";
  });

  const onShortcut = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "c" && (e.altKey)) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onShortcut(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggleCitedOnly = () => {
    setShowCitedOnly((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(CITED_ONLY_STORAGE_KEY, next ? "1" : "0");
      }
      return next;
    });
  };

  const citedPaperIds = useMemo(() => {
    const citedPapers = getCitedPapers(text, sources);
    return new Set(citedPapers.map((paper) => paper.paperId));
  }, [sources, text]);

  const indexedSources = useMemo(
    () => sources.map((source, idx) => ({ source, idx })),
    [sources],
  );

  const visibleSources = useMemo(() => {
    if (!showCitedOnly) {
      return indexedSources;
    }

    return indexedSources.filter(({ source }) =>
      citedPaperIds.has(source.paperId),
    );
  }, [citedPaperIds, indexedSources, showCitedOnly]);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible w-full min-w-0 mt-4"
    >
      <HStack className="items-center justify-between gap-2">
        <HStack className="items-center gap-2 ">
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="group w-fit cursor-pointer justify-between"
              aria-label="Toggle result list"
            >
              Results
              <ChevronRightIcon className="size-4 transition-transform duration-300 group-data-[state=open]:rotate-90" />
            </Button>
          </CollapsibleTrigger>
          <ExportDropdown
            text={text}
            papers={sources}
            cited_papers={visibleSources.map((source) => source.source)}
          />
        </HStack>
        <HStack className="gap-2 items-center">
          <Switch
            id="show-cited-only"
            size="sm"
            checked={showCitedOnly}
            onClick={toggleCitedOnly}
            className="cursor-pointer"
          />
          <Label htmlFor="show-cited-only" className="cursor-pointer">
            Cited only
          </Label>
        </HStack>
      </HStack>

      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down duration-500">
        <VStack className="mt-2 space-y-2 min-w-0">
          {visibleSources.map(({ source, idx }) => (
            <PaperCard
              key={source.paperId || idx}
              idx={idx}
              paperMetadata={source}
              isViewing={
                Boolean(viewingPaperId) && viewingPaperId === source.paperId
              }
              isSelected={selectedPaperIds.includes(source.paperId)}
              onSelect={() => onTogglePaperSelection?.(source)}
              onView={onViewPaper}
            />
          ))}
        </VStack>
      </CollapsibleContent>
    </Collapsible>
  );
}
