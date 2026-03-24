"use client";

/**
 * ChatInput Components - Reusable chat input components with composable addons
 *
 * Usage:
 *
 * 1. ChatInput (Base component) - Core input with customizable addons
 *    ```tsx
 *    <ChatInput
 *      onSend={(msg) => console.log(msg)}
 *      placeholder="Type a message..."
 *      blockStart={<MyCustomTopAddon />}
 *      blockEnd={<MyCustomBottomAddon />}
 *    />
 *    ```
 *
 * 2. ChatInputMain - Full-featured input with filters and pipeline options
 *    ```tsx
 *    <ChatInputMain
 *      onSend={(msg) => console.log(msg)}
 *      filters={filters}
 *      onFiltersChange={setFilters}
 *      useHybridPipeline={true}
 *      setUseHybridPipeline={setUseHybridPipeline}
 *    />
 *    ```
 */

import { useState } from "react";
import { InputGroupButton } from "@/components/ui/input-group";
import { Filter, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FilterPanel, type SearchFilters } from "./FilterPanel";
import { Box } from "@/components/layout/box";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HStack } from "@/components/layout/hstack";
import { VStack } from "@/components/layout/vstack";
import { BaseChatInputProps, ChatInput } from "./_shared/ChatInput";
import { PaperMetadata } from "@/types/paper.type";
import { TypographyP } from "@/components/global/typography";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import pluralize from "pluralize";

export interface ChatInputMainProps extends BaseChatInputProps {
  isAtBottom?: boolean;
  filters?: SearchFilters;
  onFiltersChange?: (filters: SearchFilters) => void;
  pipeline?: "database" | "hybrid";
  onPipelineChange?: (pipeline: "database" | "hybrid") => void;
  selectedScopedPapers?: PaperMetadata[];
  onRemoveScopedPaper?: (paperId: string) => void;
  onClearScopedPapers?: () => void;
  // Deprecated - kept for backward compatibility
  useHybridPipeline?: boolean;
  setUseHybridPipeline?: (value: boolean) => void;
}

// Main ChatInput with filters and pipeline options
export function ChatInputMain({
  onSend,
  onFocus,
  isDisabled,
  isAtBottom = false,
  placeholder,
  filters = {},
  onFiltersChange,
  pipeline = "database",
  onPipelineChange,
  selectedScopedPapers = [],
  onRemoveScopedPaper,
  onClearScopedPapers,
  useHybridPipeline,
  setUseHybridPipeline,
  blockStart,
}: ChatInputMainProps) {
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const SCOPED_PAPER_COLLAPSE_THRESHOLD = 6;

  // Check if any filters are active
  const activeFilterCount = [
    filters.openAccessOnly,
    filters.excludePreprints,
    filters.topJournalsOnly,
    filters.yearRange?.min || filters.yearRange?.max,
  ].filter(Boolean).length;

  const handleFiltersChange = (newFilters: SearchFilters) => {
    onFiltersChange?.(newFilters);
  };

  const handlePipelineToggle = () => {
    if (onPipelineChange) {
      const nextPipeline = pipeline === "database" ? "hybrid" : "database";
      onPipelineChange(nextPipeline);
    } else if (setUseHybridPipeline) {
      setUseHybridPipeline(!useHybridPipeline);
    }
  };

  const getPipelineLabel = () => {
    if (pipeline === "database") return "Database";
    if (pipeline === "hybrid") return "Hybrid (Beta)";
    return useHybridPipeline ? "Hybrid (Beta)" : "Database";
  };

  const isPipelineActive = pipeline !== "database" || useHybridPipeline;

  const shouldCollapseScopedPapers =
    selectedScopedPapers.length > SCOPED_PAPER_COLLAPSE_THRESHOLD;

  const scopedBlockStart =
    selectedScopedPapers.length > 0 ? (
      <HStack className="items-center gap-2 px-1 py-0.5">
        {shouldCollapseScopedPapers ? (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Badge
                variant="secondary"
                className="max-w-[260px] cursor-default"
              >
                <TypographyP size="xs" className="truncate">
                  Papers ({selectedScopedPapers.length})
                </TypographyP>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="ml-1 h-4 w-4"
                  onClick={() => onClearScopedPapers?.()}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </HoverCardTrigger>
            <HoverCardContent className="w-96 p-3">
              <VStack className="items-start gap-2 max-h-64 overflow-y-auto">
                {selectedScopedPapers.map((paper) => (
                  <TypographyP
                    key={paper.paperId}
                    size="xs"
                    className="w-full truncate"
                  >
                    • {paper.title}
                  </TypographyP>
                ))}
              </VStack>
            </HoverCardContent>
          </HoverCard>
        ) : (
          <HStack className="flex-1 flex-wrap gap-1">
            {selectedScopedPapers.length > 1 && (
              <Badge
                variant="default"
                className="text-sm cursor-pointer shadow-sm"
                onClick={() => onClearScopedPapers?.()}
              >
                Clear
                <X className="h-3 w-3" />
              </Badge>
            )}
            {selectedScopedPapers.map((paper) => (
              <Badge
                key={paper.paperId}
                variant="secondary"
                className="max-w-[220px] pr-1"
              >
                <TypographyP size="xs" className="truncate">
                  {paper.title}
                </TypographyP>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="ml-1 h-4 w-4"
                  aria-label={`Remove ${paper.title} from scoped papers`}
                  onClick={() => onRemoveScopedPaper?.(paper.paperId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </HStack>
        )}
      </HStack>
    ) : null;

  // Default block-end addon with filters and send button
  const defaultBlockEnd = (
    <>
      <InputGroupButton
        variant="ghost"
        className={cn(
          "rounded-full transition-colors relative",
          activeFilterCount > 0
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "",
        )}
        type="button"
        onClick={() => setFilterPanelOpen(true)}
      >
        <Filter className="h-4 w-4" />
        Filter {activeFilterCount > 0 ? `(${activeFilterCount})` : null}
      </InputGroupButton>
      <HStack
        className={cn(
          "items-center gap-2 cursor-pointer",
          isPipelineActive ? "text-secondary" : "text-muted-foreground",
        )}
        onClick={handlePipelineToggle}
      >
        <Switch size="sm" checked={isPipelineActive} />
        <Label className="text-sm cursor-pointer">{getPipelineLabel()}</Label>
      </HStack>

      <Separator orientation="vertical" className="ml-auto h-4" />
    </>
  );

  return (
    <Box
      className={cn(
        "relative transition-all duration-500 ease-out p-4",
        isAtBottom && "mx-auto max-w-4xl",
      )}
    >
      <ChatInput
        onSend={onSend}
        onFocus={onFocus}
        isDisabled={isDisabled}
        placeholder={placeholder}
        blockStart={blockStart || scopedBlockStart}
        blockEnd={defaultBlockEnd}
      />

      <FilterPanel
        open={filterPanelOpen}
        onOpenChange={setFilterPanelOpen}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
    </Box>
  );
}
