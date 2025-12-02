import { useState, useCallback } from "react";

interface ProgressState {
  steps: string[];
  subtopics: [string, string][];
  thoughts: string[];
}

export function useProgressTracking() {
  const [progress, setProgress] = useState<ProgressState>({
    steps: [],
    subtopics: [],
    thoughts: [],
  });

  const addStep = useCallback((step: string) => {
    setProgress((prev) => ({ ...prev, steps: [...prev.steps, step] }));
  }, []);

  const addThought = useCallback((thought: string) => {
    setProgress((prev) => ({ ...prev, thoughts: [...prev.thoughts, thought] }));
  }, []);

  const setSubtopics = useCallback((subtopics: [string, string][]) => {
    setProgress((prev) => ({ ...prev, subtopics }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({ steps: [], subtopics: [], thoughts: [] });
  }, []);

  return {
    progress,
    addStep,
    addThought,
    setSubtopics,
    resetProgress,
  };
}
