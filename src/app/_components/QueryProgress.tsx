"use client";

import { useState, useMemo } from "react";
import { formatEvent } from "@/lib/helper/format";
import { ThoughtEvent } from "@/lib/stream";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

interface QueryProgressProps {
  currentPhase: string | null;
  phaseMessage: string | null;
  progress: number;
  thoughts: ThoughtEvent[];
  analysisStats: Record<string, unknown> | null;
}

// Define common phases in order with display names
const PHASES = [
  { key: "query_understanding", label: "Understanding" },
  { key: "search", label: "Search" },
  { key: "retrieval", label: "Retrieval" },
  { key: "analysis", label: "Analysis" },
  { key: "generation", label: "Done" },
  { key: "complete", label: "Complete" },
];

export function QueryProgress({
  currentPhase,
  phaseMessage,
  progress,
  thoughts,
  analysisStats,
}: QueryProgressProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const formattedPhase = formatEvent(currentPhase);
  const formattedMessage = formatEvent(phaseMessage);
  const formattedThoughts = thoughts.map((thought) => ({
    ...thought,
    type: formatEvent(thought.type) || "Thought",
  }));
  const formattedStats = analysisStats
    ? Object.fromEntries(
        Object.entries(analysisStats).map(([key, value]) => [
          formatEvent(key) || key,
          value,
        ])
      )
    : null;

  // Determine current step index
  const currentStepIndex = useMemo(() => {
    if (!currentPhase) return -1;
    const index = PHASES.findIndex((phase) =>
      currentPhase.toLowerCase().includes(phase.key)
    );
    return index !== -1 ? index : PHASES.length - 1;
  }, [currentPhase]);

  const isDone =
    progress === 100 || currentPhase?.toLowerCase().includes("complete");

  // Don't render if no activity yet
  if (!currentPhase && thoughts.length === 0 && !analysisStats) {
    return null;
  }

  const hasContent =
    formattedMessage || formattedStats || formattedThoughts.length > 0;

  // Get latest thought for collapsed view
  const latestThought =
    formattedThoughts.length > 0
      ? formattedThoughts[formattedThoughts.length - 1]
      : null;

  return (
    <div className="mb-3">
      {/* Clickable Header */}
      <button
        onClick={() => hasContent && setIsExpanded(!isExpanded)}
        disabled={!hasContent}
        className="w-full px-3 py-2.5 hover:bg-accent/50 transition-colors disabled:cursor-default text-left rounded-lg"
      >
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isDone ? (
            <span className="text-sm font-semibold text-foreground truncate">
              Completed
            </span>
            ) : (
              <span className="text-sm font-semibold text-foreground truncate">
                {isExpanded
                  ? `Current Step: ${formattedPhase || "Starting..."}`
                  : `Step: ${formattedPhase || "Starting..."}`}
              </span>
            )}
            {!isDone && (latestThought || formattedMessage) && (
            <span className="text-xs text-foreground/70 truncate flex-1">
              {latestThought?.content || formattedMessage}
            </span>
          )}
          </div>

          {hasContent && (
            isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
            )
          )}
        </div>
      </button>

      {/* Expanded content - not clickable */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="px-3 pt-2 space-y-1.5"
          >
            {PHASES.slice(0, -1).map((phase, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isPending = idx > currentStepIndex;
              const isLast = idx === PHASES.length - 2;

              return (
                <motion.div
                  key={phase.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="relative"
                >
                  {/* Connecting line */}
                  {!isLast && (
                    <div
                      className={`absolute left-[14px] top-[26px] w-0.5 h-[calc(100%-13px)] ${
                        isCompleted ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}

                  <div
                    className={`flex items-center gap-2.5 py-1.5 px-2 rounded-md transition-colors relative ${
                      isCurrent ? "bg-primary/10" : ""
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        isCurrent
                          ? "text-primary font-semibold"
                          : isCompleted
                          ? "text-foreground/70"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {phase.label}
                    </span>
                  </div>

                  {/* Phase Details - Show for current phase */}
                  {isCurrent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-6 mt-1 space-y-1 mb-2 pl-3 border-l-2 border-border/50"
                    >
                      {/* Phase Message */}
                      {formattedMessage && (
                        <p className="text-xs text-muted-foreground italic">
                          {formattedMessage}
                        </p>
                      )}

                      {/* Thoughts for current phase */}
                      {formattedThoughts.length > 0 && (
                        <ul className="space-y-1">
                          <AnimatePresence mode="popLayout">
                            {formattedThoughts
                              .slice(-3)
                              .map((thought, thoughtIdx) => (
                                <motion.li
                                  key={`${thought.type}-${thoughtIdx}`}
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 5 }}
                                  transition={{ duration: 0.2 }}
                                  className="text-xs text-foreground/70 pl-1"
                                >
                                  <span className="text-muted-foreground">
                                    •{" "}
                                  </span>
                                  <span className="font-medium text-foreground/80">
                                    {thought.type}:
                                  </span>{" "}
                                  <span>{thought.content}</span>
                                </motion.li>
                              ))}
                          </AnimatePresence>
                        </ul>
                      )}

                      {/* Analysis Stats - Show during analysis or later phases */}
                      {formattedStats && phase.key === "analysis" && (
                        <div className="text-xs text-muted-foreground pt-1">
                          <span className="text-muted-foreground">• </span>
                          <span className="font-medium text-foreground/80">
                            Analysis:
                          </span>{" "}
                          {Object.entries(formattedStats).map(
                            ([key, value], i, arr) => (
                              <span key={key}>
                                <span className="capitalize">{key}</span>
                                <span className="mx-0.5">:</span>
                                <span className="font-semibold text-foreground">
                                  {String(value)}
                                </span>
                                {i < arr.length - 1 && (
                                  <span className="text-muted-foreground/50 mx-1">
                                    •
                                  </span>
                                )}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
