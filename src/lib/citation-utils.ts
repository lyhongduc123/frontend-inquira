import type { PaperMetadata } from "@/types/paper.type";

/**
 * Extracts all paper IDs that are cited in the message text
 * Supports both formats:
 * - (cite:paper_id)
 * - [number](paper_id)
 */
export function extractCitedPaperIds(text: string): string[] {
  const citedIds = new Set<string>();

  // Extract from (cite:paper_id) format
  const citeMatches = text.matchAll(/\(cite:([^)]+)\)/g);
  for (const match of citeMatches) {
    citedIds.add(match[1]);
  }

  // Extract from [number](paper_id) format
  const linkMatches = text.matchAll(/\[\d+\]\(([^)]+)\)/g);
  for (const match of linkMatches) {
    citedIds.add(match[1]);
  }

  return Array.from(citedIds);
}

/**
 * Filters sources to only include papers that are cited in the message text
 * Returns papers in the order they appear in the sources array
 */
export function getCitedPapers(
  text: string,
  sources?: PaperMetadata[]
): PaperMetadata[] {
  if (!sources || sources.length === 0) {
    return [];
  }

  const citedIds = new Set(extractCitedPaperIds(text));
  
  return sources.filter((source) => 
    source.paperId && citedIds.has(source.paperId)
  );
}

/**
 * Creates a citation number map for cited papers
 * Returns a map of paperId to citation number (1-indexed)
 */
export function createCitationMap(
  text: string,
  sources?: PaperMetadata[]
): Map<string, number> {
  const citedPapers = getCitedPapers(text, sources);
  const map = new Map<string, number>();
  
  citedPapers.forEach((paper, index) => {
    if (paper.paperId) {
      map.set(paper.paperId, index + 1);
    }
  });
  
  return map;
}
