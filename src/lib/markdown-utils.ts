import type { PaperMetadata } from "@/types/paper.type";
import {
  createScopedCitationRefMap,
  extractScopedCitationRefs,
  getScopedCitationKey,
} from "@/lib/scoped-citation-utils";
import type { ScopedCitationRef } from "@/lib/scoped-citation-utils";

export const LEGACY_FORMAT_REGEX = /\[(\d+)\]\(([^)]+)\)/g;
export const SCOPED_CITATION_REGEX = /\(cite:([^|)]+)\|([^|)]+)(?:\|(\d+)\|(\d+))?\)/g;
export const CITATIONS_REGEX = /\(cite:([^)]+)\)/g;

function getSourceFromCitationToken(
  token: string,
  sources?: PaperMetadata[],
): PaperMetadata | undefined {
  if (!sources || sources.length === 0) {
    return undefined
  }

  const normalized = token.trim()
  if (!normalized) {
    return undefined
  }

  const byPaperId = sources.find((source) => source.paperId === normalized)
  if (byPaperId) {
    return byPaperId
  }

  // Support numeric token as source list index (primarily 0-based).
  if (/^\d+$/.test(normalized)) {
    const rawIndex = Number(normalized)
    if (rawIndex >= 0 && rawIndex < sources.length) {
      return sources[rawIndex]
    }

    // Backward-safe fallback for 1-based index inputs.
    const oneBased = rawIndex - 1
    if (oneBased >= 0 && oneBased < sources.length) {
      return sources[oneBased]
    }
  }

  return undefined
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

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

/**
 * Converts markdown citation links to custom citation HTML elements.
 * Supports formats:
 * - (cite:paper_id) - single auto-numbered citation
 * - (cite:paper_id1, cite:paper_id2) - multiple citations in one parenthesis
 * - (cite:paper_id|chunk_id) - scoped citation
 * - (cite:paper_id|chunk_id|char_start|char_end) - scoped citation with span
 * - [1](paper_id) - legacy format with explicit numbers
 * Citation numbers match the position in the sources array.
 */
export function convertCitationsToElements(
  text: string,
  sources?: PaperMetadata[],
  scopedQuoteRefs?: ScopedCitationRef[],
): string {
  const citationMap = new Map<string, number>();
  if (sources && Array.isArray(sources)) {
    sources.forEach((source, index) => {
      if (source.paperId) {
        citationMap.set(source.paperId, index + 1);
      }
    });
  }

  const scopedMap = createScopedCitationRefMap(scopedQuoteRefs);
  let result = text.replace(SCOPED_CITATION_REGEX,
    (match, paperIdRaw, chunkIdRaw, charStart, charEnd) => {
      const token = paperIdRaw?.trim();
      const chunkId = chunkIdRaw?.trim();

      if (!token || !chunkId) {
        return match;
      }

      const source = getSourceFromCitationToken(token, sources)
      const paperId = source?.paperId

      if (!paperId) {
        return match
      }

      const number = citationMap.get(paperId);
      if (number === undefined) {
        return match;
      }

      const scopedKey = getScopedCitationKey({
        paperId,
        chunkId,
        charStart: charStart ? Number(charStart) : null,
        charEnd: charEnd ? Number(charEnd) : null,
      });

      const scopedRef = scopedMap.get(match) ?? scopedMap.get(scopedKey);

      const quote = escapeHtmlAttribute(scopedRef?.quote ?? "");
      const section = escapeHtmlAttribute(scopedRef?.section ?? "");

      return `<scoped-citation data-id="${paperId}" data-number="${number}" data-chunk-id="${chunkId}" data-char-start="${charStart ?? ""}" data-char-end="${charEnd ?? ""}" data-key="${scopedKey}" data-marker="${match}" data-section="${section}" data-quote="${quote}"/>`;
    }
  );

  // Handle both single and multiple citations: (cite:paper1) or (cite:paper1, cite:paper2, ...)
  result = result.replace(CITATIONS_REGEX, (match, content) => {
    // Split by comma and trim whitespace
    const paperIds = content.split(',').map((id: string) => id.trim());
    
    // Check if there are multiple cite: prefixes (multiple citations)
    const citations = paperIds
      .map((part: string) => {
        const token = part.startsWith('cite:') ? part.slice(5).trim() : part.trim();
        const source = getSourceFromCitationToken(token, sources)
        const paperId = source?.paperId
        if (!paperId) {
          return `<missing-citation />`
        }

        const number = citationMap.get(paperId);
        return number !== undefined 
          ? `<citation data-id="${paperId}" data-number="${number}"/>`
          : `<missing-citation />`;
      })
      .filter((citation: string | null) => citation !== null);
    
    // If we successfully converted all citations, return them; otherwise return original
    return citations.length > 0 ? citations.join('') : match;
  });

  // Support legacy [1](paper_id) format
  result = result.replace(LEGACY_FORMAT_REGEX, (match, number, paperId) => {
    return `<citation data-id="${paperId}" data-number="${number}"/>`;
  });

  return result;
}

export { extractScopedCitationRefs };
