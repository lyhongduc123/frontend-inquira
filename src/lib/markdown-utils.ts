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

import type { PaperMetadata } from "@/types/paper.type";

/**
 * Converts markdown citation links to custom citation HTML elements.
 * Supports formats:
 * - (cite:paper_id) - single auto-numbered citation
 * - (cite:paper_id1, cite:paper_id2) - multiple citations in one parenthesis
 * - [1](paper_id) - legacy format with explicit numbers
 * Citation numbers match the position in the sources array.
 */
export function convertCitationsToElements(text: string, sources?: PaperMetadata[]): string {
  const citationMap = new Map<string, number>();
  if (sources && Array.isArray(sources)) {
    sources.forEach((source, index) => {
      if (source.paperId) {
        citationMap.set(source.paperId, index + 1);
      }
    });
  }

  // Handle both single and multiple citations: (cite:paper1) or (cite:paper1, cite:paper2, ...)
  let result = text.replace(/\(cite:([^)]+)\)/g, (match, content) => {
    // Split by comma and trim whitespace
    const paperIds = content.split(',').map((id: string) => id.trim());
    
    // Check if there are multiple cite: prefixes (multiple citations)
    const citations = paperIds
      .map((part: string) => {
        // Remove 'cite:' prefix if present
        const paperId = part.startsWith('cite:') ? part.slice(5).trim() : part.trim();
        const number = citationMap.get(paperId);
        return number !== undefined 
          ? `<citation data-id="${paperId}" data-number="${number}"/>`
          : null;
      })
      .filter((citation: string | null) => citation !== null);
    
    // If we successfully converted all citations, return them; otherwise return original
    return citations.length > 0 ? citations.join('') : match;
  });

  // Support legacy [1](paper_id) format
  result = result.replace(/\[(\d+)\]\(([^)]+)\)/g, (match, number, paperId) => {
    return `<citation data-id="${paperId}" data-number="${number}"/>`;
  });

  return result;
}
