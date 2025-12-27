/**
 * Normalizes markdown list formatting by fixing excessive spacing
 * and ensuring consistent line breaks.
 */
export function normalizeMarkdownLists(text: string): string {
  return (
    text
      // Fix stars/dashes/plus bullets with excessive spaces: "*   Text" → "* Text"
      // Only replace if there are 2 or more spaces AND followed by non-whitespace
      .replace(/^([\*\-+])\s{2,}(?=\S)/gm, "$1 ")
      // Fix numbered bullets with excessive spaces: "1.  Text" → "1. Text"
      // Only replace if there are 2 or more spaces AND followed by non-whitespace
      .replace(/^(\d+\.)\s{2,}(?=\S)/gm, "$1 ")
      // Ensure consistent line breaks (max 2 consecutive newlines)
      .replace(/\n{3,}/g, "\n\n")
  );
}

import type { PaperSource } from "@/types/paper.type";

/**
 * Converts markdown citation links to custom citation HTML elements.
 * Supports formats:
 * - (cite:paper_id) - auto-numbered citations, matched against sources array
 * - [1](paper_id) - legacy format with explicit numbers
 * Citation numbers match the position in the sources array.
 */
export function convertCitationsToElements(text: string, sources?: PaperSource[]): string {
  // Create a map of paper_id to citation number (based on position in sources array)
  const citationMap = new Map<string, number>();
  if (sources && Array.isArray(sources)) {
    sources.forEach((source, index) => {
      citationMap.set(source.paper_id, index + 1);
    });
  }

  // First, replace (cite:paper_id) format with numbers from sources
  let result = text.replace(/\(cite:([^)]+)\)/g, (match, paperId) => {
    const number = citationMap.get(paperId);
    if (number !== undefined) {
      return `<citation data-id="${paperId}" data-number="${number}"/>`;
    }
    // If paper_id not in sources, return empty or just the number
    return '';
  });

  // Also support legacy [1](paper_id) format
  result = result.replace(/\[(\d+)\]\(([^)]+)\)/g, (match, number, paperId) => {
    return `<citation data-id="${paperId}" data-number="${number}"/>`;
  });

  return result;
}
