import { useCallback, useMemo, useState } from "react";
import type { PaperMetadata } from "@/types/paper.type";

interface UseScopedPaperSelectionResult {
  selectedScopedPapers: PaperMetadata[];
  selectedScopedPaperIds: string[];
  mergeScopedPapers: (papers: PaperMetadata[]) => void;
  toggleScopedPaper: (paperId: string) => void;
  removeScopedPaper: (paperId: string) => void;
  clearScopedPapers: () => void;
}

/**
 * Manages scoped paper selection for chat queries.
 */
export function useScopedPaperSelection(
  availablePapersMap: Map<string, PaperMetadata>,
): UseScopedPaperSelectionResult {
  const [selectedScopedPapers, setSelectedScopedPapers] = useState<
    PaperMetadata[]
  >([]);

  const mergeScopedPapers = useCallback((papers: PaperMetadata[]) => {
    if (!papers || papers.length === 0) return;

    setSelectedScopedPapers((prev) => {
      const mergedMap = new Map<string, PaperMetadata>();

      for (const paper of prev) {
        mergedMap.set(paper.paperId, paper);
      }

      for (const paper of papers) {
        if (paper?.paperId) {
          mergedMap.set(paper.paperId, paper);
        }
      }

      return Array.from(mergedMap.values());
    });
  }, []);

  const toggleScopedPaper = useCallback(
    (paperId: string) => {
      const paper = availablePapersMap.get(paperId);
      if (!paper) return;

      setSelectedScopedPapers((prev) => {
        if (prev.some((p) => p.paperId === paperId)) {
          return prev.filter((p) => p.paperId !== paperId);
        }
        return [...prev, paper];
      });
    },
    [availablePapersMap],
  );

  const removeScopedPaper = useCallback((paperId: string) => {
    setSelectedScopedPapers((prev) => prev.filter((p) => p.paperId !== paperId));
  }, []);

  const clearScopedPapers = useCallback(() => {
    setSelectedScopedPapers([]);
  }, []);

  const selectedScopedPaperIds = useMemo(
    () => selectedScopedPapers.map((paper) => paper.paperId),
    [selectedScopedPapers],
  );

  return {
    selectedScopedPapers,
    selectedScopedPaperIds,
    mergeScopedPapers,
    toggleScopedPaper,
    removeScopedPaper,
    clearScopedPapers,
  };
}