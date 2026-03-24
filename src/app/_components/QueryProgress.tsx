"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useProgressStore } from "@/store/progress-store";
import {
  Loader2,
  Sparkles,
  Search,
  ListOrdered,
  ListTodo,
  ChevronDownIcon,
  ChevronRightIcon,
} from "lucide-react";
import { TypographyP } from "@/components/global/typography";
import { HStack } from "@/components/layout/hstack";
import { VStack } from "@/components/layout/vstack";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EventType } from "@/lib/stream/event.types";
import { Streamdown } from "streamdown";
import { Separator } from "@/components/ui/separator";
import { Box } from "@/components/layout/box";
import { cn } from "@/lib/utils";
import { pl } from "date-fns/locale";
import pluralize from "pluralize";
import * as changeCase from "change-case";

interface ProgressStep {
  type: string;
  content?: string; // Optional: only for reasoning
  metadata?: Record<string, unknown>;
  timestamp: number;
}

interface QueryProgressProps {
  queryId?: string | null;
  sourceCount?: number;
  progressData?: {
    steps: ProgressStep[];
    isComplete: boolean;
    startedAt: number;
    completedAt?: number;
    currentPhase?: string | null;
    currentStep?: number;
    totalSteps?: number;
  };
}

export function QueryProgress({
  queryId,
  sourceCount,
  progressData,
}: QueryProgressProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({});
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
  const receivedStepsCount = displayThoughts.length;
  const stepsCount = queryProgress.totalSteps || receivedStepsCount;
  const hasSteps = stepsCount > 0;
  const latestStep = receivedStepsCount > 0 ? displayThoughts[receivedStepsCount - 1] : null;

  const rankingStep = [...displayThoughts]
    .reverse()
    .find((step) => step.type === EventType.RANKING);

  const rankingSourceCount =
    typeof rankingStep?.metadata?.total_papers === "number"
      ? rankingStep.metadata.total_papers
      : null;

  const completedSourceCount =
    typeof sourceCount === "number" ? sourceCount : rankingSourceCount;

  const currentLabel =
    queryProgress.currentPhase || latestStep?.type || "processing";
  const currentStepNumber = queryProgress.currentStep || receivedStepsCount;

  const formatDuration = (start: number, end: number) => {
    const duration = end - start;
    const seconds = Math.floor(duration / 1000);
    return seconds < 60
      ? `${seconds}s`
      : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const parseContent = (step: ProgressStep): ReactNode | string => {
    if (step.type === EventType.REASONING && step.content) {
      return step.content;
    }

    if (step.type === EventType.SEARCHING && step.metadata?.queries) {
      const queries = Array.isArray(step.metadata.queries)
        ? (step.metadata.queries as string[]).filter(Boolean)
        : [];

      if (queries.length > 0) {
        return (
          queries.map((q, idx) => (
            <span key={idx}>
              {q}
              {idx < queries.length - 1 && <br />}
            </span>
          ))
        );
      }

      return "Searching academic databases...";
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

  const toggleStep = (stepKey: string) => {
    setOpenSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <Button
        onClick={() => hasSteps && setIsSheetOpen(true)}
        disabled={!hasSteps}
        variant="ghost"
        className="max-w-[50%] w-fit justify-between rounded-lg"
      >
        <>
          <HStack className="items-center gap-2 min-w-0">
            <ListTodo size={14} className="text-secondary shrink-0" />
            <TypographyP size="xs" weight="medium" className="truncate">
              {queryProgress.totalSteps && queryProgress.totalSteps > 0
                ? `${currentStepNumber}/${queryProgress.totalSteps} ${pluralize("step", queryProgress.totalSteps)}`
                : pluralize("step", stepsCount, true)}
            </TypographyP>
          </HStack>
          <Separator orientation="vertical" className="relative mx-2 h-4 max-w-4" />
          <HStack className="items-center gap-1 min-w-0">
            {!queryProgress.isComplete && (
              <Loader2
                size={12}
                className="animate-spin text-secondary shrink-0"
              />
            )}
            <TypographyP
              size="xs"
              className="truncate"
            >
              {queryProgress.isComplete
                ? `${pluralize("source", completedSourceCount ?? 0, true)}`
                : `${currentLabel}`}
            </TypographyP>
          </HStack>
        </>
      </Button>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex h-full flex-col"
      >
        <SheetHeader className="shrink-0">
          <SheetTitle>Query Steps</SheetTitle>
          <SheetDescription>
            {queryProgress.totalSteps
              ? `${currentStepNumber}/${queryProgress.totalSteps} ${pluralize("step", queryProgress.totalSteps)}`
              : pluralize("step", stepsCount, true)}
            {queryProgress.isComplete && queryProgress.completedAt
              ? ` in ${formatDuration(queryProgress.startedAt, queryProgress.completedAt)}`
              : ""}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <VStack className="gap-2 px-4">
            {displayThoughts.map((thought, idx) => {
              const stepKey = `${thought.type}-${idx}`;
              const isOpen =
                openSteps[stepKey] ?? idx === displayThoughts.length - 1;

              const isLastStep = idx === displayThoughts.length - 1;

              return (
                <Box key={stepKey} className="w-full">
                  <Collapsible
                    key={stepKey}
                    open={isOpen}
                    onOpenChange={() => toggleStep(stepKey)}
                    className=""
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full h-auto justify-between rounded-md"
                      >
                        <HStack className="gap-2 items-center min-w-0">
                          <TypeIcon type={thought.type} />
                          <TypographyP
                            size="sm"
                            weight="medium"
                            className="text-foreground/80 capitalize truncate"
                          >
                            Step {idx + 1}: {thought.type}
                          </TypographyP>
                        </HStack>
                        <TypographyP size="xs" variant="muted">
                          <ChevronRightIcon
                            className={cn(
                              "size-4 transition-transform",
                              isOpen && "rotate-90",
                            )}
                          />
                        </TypographyP>
                      </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="p-4">
                      {thought.type === EventType.REASONING ? (
                        <ReasoningRenderer>
                          {parseContent(thought) as string}
                        </ReasoningRenderer>
                      ) : (
                        <TypographyP
                          size="sm"
                          variant="muted"
                          className="leading-relaxed"
                        >
                          {parseContent(thought)}
                        </TypographyP>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </Box>
              );
            })}
          </VStack>
        </ScrollArea>
      </SheetContent>
    </Sheet>
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

const ReasoningRenderer = ({ children }: { children?: string }) => {
  return (
    <Streamdown
      className="text-sm text-muted-foreground leading-relaxed"
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
