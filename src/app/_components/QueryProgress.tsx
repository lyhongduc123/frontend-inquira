"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { formatEvent } from "@/lib/helper/format";
import { ThoughtEvent } from "@/lib/stream";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface QueryProgressProps {
  currentPhase: string | null;
  phaseMessage: string | null;
  progress: number;
  thoughts: ThoughtEvent[];
  analysisStats: Record<string, unknown> | null;
}

// Define common phases in order
const PHASES = [
  "query_understanding",
  "search",
  "retrieval",
  "analysis",
  "generation",
  "complete",
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
      currentPhase.toLowerCase().includes(phase)
    );
    return index !== -1 ? index : PHASES.length - 1;
  }, [currentPhase]);

  const isDone = progress === 100 || currentPhase?.toLowerCase().includes("complete");

  // Don't render if no activity yet
  if (!currentPhase && thoughts.length === 0 && !analysisStats) {
    return null;
  }

  return (
    <Card className="mb-3 overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {!isDone && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />}
          <span className="text-xs font-medium truncate">
            {formattedPhase || "Processing..."}
          </span>
          {/* Step Indicators */}
          <div className="hidden sm:flex items-center gap-1 ml-auto mr-2">
            {PHASES.slice(0, -1).map((_, idx) => (
              <div
                key={idx}
                className={`h-1 w-6 rounded-full transition-colors ${
                  idx < currentStepIndex
                    ? "bg-primary"
                    : idx === currentStepIndex
                    ? "bg-primary/60"
                    : "bg-secondary"
                }`}
              />
            ))}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 border-t">
              {/* Phase Message */}
              {formattedMessage && (
                <p className="text-xs text-muted-foreground pt-2">
                  {formattedMessage}
                </p>
              )}

              {/* Analysis Stats */}
              {formattedStats && (
                <div className="flex items-start gap-2 text-xs pt-1">
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium mb-1">Analysis</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
                      {Object.entries(formattedStats).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-[11px]">
                          <span className="capitalize">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Thoughts */}
              {formattedThoughts.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <AnimatePresence mode="popLayout">
                    {formattedThoughts.slice(-2).map((thought, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-start gap-2 text-xs"
                      >
                        <Brain className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-muted-foreground font-medium">
                            {thought.type}:
                          </span>{" "}
                          <span className="text-foreground/80">{thought.content}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
