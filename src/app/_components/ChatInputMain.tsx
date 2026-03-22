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
import { BaseChatInputProps, ChatInput } from "./_shared/ChatInput";
import { PaperMetadata } from "@/types/paper.type";
import { TypographyP } from "@/components/global/typography";
import { Button } from "@/components/ui/button";

export interface ChatInputMainProps extends BaseChatInputProps {
  isAtBottom?: boolean;
  filters?: SearchFilters;
  onFiltersChange?: (filters: SearchFilters) => void;
  pipeline?: "database" | "hybrid" | "standard";
  onPipelineChange?: (pipeline: "database" | "hybrid" | "standard") => void;
  selectedScopedPapers?: PaperMetadata[];
  onRemoveScopedPaper?: (paperId: string) => void;
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
  useHybridPipeline,
  setUseHybridPipeline,
  blockStart,
}: ChatInputMainProps) {
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

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

  // Cycle through pipeline options: database -> hybrid -> standard -> database
  const handlePipelineToggle = () => {
    if (onPipelineChange) {
      const nextPipeline =
        pipeline === "database"
          ? "hybrid"
          : pipeline === "hybrid"
            ? "standard"
            : "database";
      onPipelineChange(nextPipeline);
    } else if (setUseHybridPipeline) {
      // Backward compatibility
      setUseHybridPipeline(!useHybridPipeline);
    }
  };

  // For backward compatibility
  const getPipelineLabel = () => {
    if (pipeline === "database") return "Database";
    if (pipeline === "hybrid") return "Hybrid (Beta)";
    if (pipeline === "standard") return "Standard";
    return useHybridPipeline ? "Hybrid (Beta)" : "Database";
  };

  const isPipelineActive = pipeline !== "database" || useHybridPipeline;

  const scopedBlockStart =
    selectedScopedPapers.length > 0 ? (
      <HStack className="items-center gap-2 px-1 py-0.5">
        <Badge variant="outline" className="text-sm">
          Scoped to {selectedScopedPapers.length} paper
          {selectedScopedPapers.length > 1 ? "s" : ""}
        </Badge>
        <HStack className="flex-1 flex-wrap gap-1">
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
            ? "bg-primary/10 text-primary hover:bg-primary/20"
            : "hover:bg-accent",
        )}
        size="icon-xs"
        type="button"
        onClick={() => setFilterPanelOpen(true)}
      >
        <Filter className="h-4 w-4" />
        {activeFilterCount > 0 && (
          <Badge
            variant="default"
            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
          >
            {activeFilterCount}
          </Badge>
        )}
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
