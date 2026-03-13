"use client";

import { useState } from "react";
import { useProgressStore } from "@/store/progress-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  History,
  Search,
  ListOrdered,
  ListTodoIcon,
} from "lucide-react";
import { TypographyP } from "@/components/global/typography";
import { HStack } from "@/components/layout/hstack";
import { VStack } from "@/components/layout/vstack";
import { Box } from "@/components/layout/box";
import { Button } from "@/components/ui/button";
import { EventType } from "@/lib/stream/event.types";
import { Streamdown } from "streamdown";

interface ProgressStep {
  type: string;
  content?: string; // Optional: only for reasoning
  metadata?: Record<string, unknown>;
  timestamp: number;
}

interface QueryProgressProps {
  queryId?: string | null;
  progressData?: {
    steps: ProgressStep[];
    isComplete: boolean;
    startedAt: number;
    completedAt?: number;
    currentPhase?: string | null;
  };
}

export function QueryProgress({ queryId, progressData }: QueryProgressProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const queryProgressFromStore = useProgressStore((state) =>
    queryId ? state.getQueryProgress(queryId) : undefined,
  );

  // Use provided progressData or query from store
  const queryProgress = progressData || queryProgressFromStore;

  if (
    !queryProgress ||
    !queryProgress.steps ||
    queryProgress.steps.length === 0
  ) {
    return null;
  }

  const displayThoughts = queryProgress.steps || [];
  const hasThoughts = displayThoughts.length > 0;

  const formatDuration = (start: number, end: number) => {
    const duration = end - start;
    const seconds = Math.floor(duration / 1000);
    return seconds < 60
      ? `${seconds}s`
      : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const parseContent = (step: ProgressStep): string => {
    if (step.type === EventType.REASONING && step.content) {
      return step.content;
    }

    if (step.type === EventType.SEARCHING && step.metadata?.queries) {
      const queries = step.metadata.queries as string[];
      return `Searching: ${queries.join(", ")}`;
    }
    if (step.type === EventType.RANKING && step.metadata?.total_papers) {
      return `Ranking ${step.metadata.total_papers} papers (${step.metadata.chunks || 0} chunks)`;
    }

    if (step.type === EventType.SEARCHING) {
      return "Searching academic databases...";
    }
    if (step.type === EventType.RANKING) {
      return "Filtering and ranking papers...";
    }
    if (step.type === EventType.REASONING) {
      return "Generating response...";
    }

    return step.content || "";
  };

  return (
    <Box className="bg-muted border border-border rounded-lg">
      {/* Header */}
      <Button
        asChild
        onClick={() => hasThoughts && setIsExpanded(!isExpanded)}
        disabled={!hasThoughts}
        variant="outline"
        className="flex-1 justify-between disabled:cursor-default min-w-0 w-full rounded-lg hover:text-secondary"
      >
        <Box>
          <HStack className="flex items-center gap-2">
            <HStack className="gap-1 items-center">
            </HStack>
            {queryProgress.isComplete ? (
              <>
                <History size={14} className="text-secondary shrink-0" />
                <TypographyP size="xs" weight="medium" className="truncate">
                  Completed
                </TypographyP>
              </>
            ) : (
              <>
                <Loader2
                  size={14}
                  className="animate-spin text-secondary shrink-0"
                />
                <TypographyP
                  size="xs"
                  weight="medium"
                  className="truncate capitalize"
                >
                  {queryProgress.currentPhase || "Processing..."}
                </TypographyP>
              </>
            )}
          </HStack>
          <HStack className="gap-1 items-center">
            {queryProgress.isComplete && queryProgress.completedAt && (
              <TypographyP size="xs" variant="muted">
                {formatDuration(
                  queryProgress.startedAt,
                  queryProgress.completedAt,
                )}
              </TypographyP>
            )}
            {hasThoughts && (
              <TypographyP size="xs" variant="muted">
                {displayThoughts.length} step
                {displayThoughts.length !== 1 ? "s" : ""}
              </TypographyP>
            )}
            {hasThoughts && (
              <Box className="ml-1">
                {isExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </Box>
            )}
          </HStack>
        </Box>
      </Button>

      {/* Expanded thoughts */}
      <AnimatePresence>
        {isExpanded && displayThoughts.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <VStack className="gap-2 p-4">
              <AnimatePresence mode="popLayout">
                {displayThoughts.map((thought, idx) => (
                  <motion.div
                    key={`${thought.type}-${idx}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HStack className="gap-2 items-start">
                      <TypeIcon type={thought.type} />
                      <VStack className="gap-0.5 flex-1 min-w-0">
                        <TypographyP
                          size="xs"
                          weight="medium"
                          className="text-foreground/80 capitalize"
                        >
                          {thought.type}
                        </TypographyP>
                        {thought.type === EventType.REASONING ? (
                          <ReasoningRenderer>
                            {parseContent(thought)}
                          </ReasoningRenderer>
                        ) : (
                          <TypographyP
                            size="xs"
                            variant="muted"
                            className="leading-relaxed"
                          >
                            {parseContent(thought)}
                          </TypographyP>
                        )}
                      </VStack>
                    </HStack>
                  </motion.div>
                ))}
              </AnimatePresence>
            </VStack>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

const TypeIcon = ({ type }: { type: string }) => {
  switch (type as EventType) {
    case EventType.SEARCHING:
      return <Search size={14} className="text-secondary shrink-0 mt-0.5" />;
    case EventType.RANKING:
      return (
        <ListOrdered size={14} className="text-secondary shrink-0 mt-0.5" />
      );
    case EventType.REASONING:
      return <Sparkles size={14} className="text-secondary shrink-0 mt-0.5" />;
    default:
      return <Sparkles size={14} className="text-secondary shrink-0 mt-0.5" />;
  }
};

const ReasoningRenderer = ({children}: {children?: string}) => {
  return (
    <Streamdown
      className="text-xs text-muted-foreground leading-relaxed"
      components={{
        h1: ({ children }) => <p className="font-medium m-0">{children}</p>,
        h2: ({ children }) => <p className="font-medium m-0">{children}</p>,
        h3: ({ children }) => <p className="font-medium m-0">{children}</p>,
        p: ({ children }) => <p className="m-0">{children}</p>,
        ul: ({ children }) => (
          <ul className="list-disc pl-3 my-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-3 my-1">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        code: ({ children }) => (
          <code className="bg-muted px-1 py-0.5 rounded text-[11px]">
            {children}
          </code>
        ),
      }}
    >
      {children || ""}
    </Streamdown>
  );
};
