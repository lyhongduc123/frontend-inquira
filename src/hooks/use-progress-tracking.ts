import { useState, useCallback } from "react";
import type { PhaseEvent, ThoughtEvent, AnalysisEvent } from "@/lib/stream";

export interface ProgressState {
  // Phase tracking
  currentPhase: string | null;
  phaseMessage: string | null;
  progress: number;
  
  // Historical data
  steps: string[];
  subtopics: [string, string][];
  thoughts: ThoughtEvent[];
  
  // Analysis metrics
  analysisStats: Record<string, unknown> | null;
}

export function useProgressTracking() {
  const [progress, setProgress] = useState<ProgressState>({
    currentPhase: null,
    phaseMessage: null,
    progress: 0,
    steps: [],
    subtopics: [],
    thoughts: [],
    analysisStats: null,
  });

  const handlePhase = useCallback((event: PhaseEvent) => {
    setProgress((prev) => ({
      ...prev,
      currentPhase: event.phase,
      phaseMessage: event.message,
      progress: event.progress ?? prev.progress,
      steps: [...prev.steps, `${event.phase}: ${event.message}`],
    }));
  }, []);

  const handleThought = useCallback((event: ThoughtEvent) => {
    setProgress((prev) => ({
      ...prev,
      thoughts: [...prev.thoughts, event],
    }));
  }, []);

  const handleAnalysis = useCallback((event: AnalysisEvent) => {
    setProgress((prev) => ({
      ...prev,
      analysisStats: event.stats ?? prev.analysisStats,
    }));
  }, []);

  // Legacy compatibility
  const addStep = useCallback((step: string) => {
    setProgress((prev) => ({ ...prev, steps: [...prev.steps, step] }));
  }, []);

  const addThought = useCallback((thought: string) => {
    const thoughtEvent: ThoughtEvent = {
      type: "generic",
      content: thought,
    };
    setProgress((prev) => ({ ...prev, thoughts: [...prev.thoughts, thoughtEvent] }));
  }, []);

  const setSubtopics = useCallback((subtopics: [string, string][]) => {
    setProgress((prev) => ({ ...prev, subtopics }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({
      currentPhase: null,
      phaseMessage: null,
      progress: 0,
      steps: [],
      subtopics: [],
      thoughts: [],
      analysisStats: null,
    });
  }, []);

  return {
    progress,
    // Structured event handlers
    handlePhase,
    handleThought,
    handleAnalysis,
    // Legacy methods
    addStep,
    addThought,
    setSubtopics,
    resetProgress,
  };
}
