import type { PaperMetadata } from "@/types/paper.type";
import { extractScopedCitationRefs } from "@/lib/scoped-citation-utils";
import {
  CITATIONS_REGEX,
  LEGACY_FORMAT_REGEX,
  SCOPED_CITATION_REGEX,
} from "./markdown-utils";

/**
 * Extracts all paper IDs that are cited in the message text
 * Supports both formats:
 * - (cite:paper_id)
 * - [number](paper_id)
 */
export function extractCitedPaperIds(text: string): string[] {
  const citedIds = new Set<string>();

  // Extract scoped markers first: (cite:paper_id|chunk_id|...)
  const scopedRefs = extractScopedCitationRefs(text);
  for (const ref of scopedRefs) {
    citedIds.add(ref.paperId);
  }

  // Extract plain/grouped cite markers:
  // - (cite:paper_id)
  // - (cite:paper_id1, cite:paper_id2)
  // - mixed with scoped tokens
  const citeMatches = text.matchAll(/cite:([^,\)\s]+)/g);
  for (const match of citeMatches) {
    const token = match[1];
    const paperId = token.split("|")[0]?.trim();
    if (paperId) {
      citedIds.add(paperId);
    }
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
  sources?: PaperMetadata[],
): PaperMetadata[] {
  if (!sources || sources.length === 0) {
    return [];
  }

  const citedIds = new Set(extractCitedPaperIds(text));

  return sources.filter(
    (source) => source.paperId && citedIds.has(source.paperId),
  );
}

/**
 * Format original content to APA style citations and build references section
 */
export function getFormattedCitedContent(
  text: string,
  cited_sources?: PaperMetadata[],
): string {
  let formattedText;

  formattedText = text.replace(LEGACY_FORMAT_REGEX, (match, paperId) => {
    const paper = cited_sources?.find((s) => s.paperId === paperId);
    if (!paper) return match;

    const firstAuthor = paper.authors?.[0] ?? "Unknown";
    const lastName = firstAuthor?.name?.split(" ").slice(-1)[0] ?? "Unknown";
    const year = paper.year ?? "n.d.";

    return `(${lastName}, ${year})`;
  });

  formattedText = formattedText.replace(
    SCOPED_CITATION_REGEX,
    (match, paperIdRaw, chunkIdRaw,) => {
      const paper = cited_sources?.find((s) => s.paperId === paperIdRaw);

      if (!paper) return match;

      const firstAuthor = paper.authors?.[0] ?? "Unknown";
      const lastName = firstAuthor?.name?.split(" ").slice(-1)[0] ?? "Unknown";
      const year = paper.year ?? "n.d.";

      return `(${lastName}, ${year})`; 
    },
  );

  formattedText = formattedText.replace(CITATIONS_REGEX, (match, content) => {
    const paperIds = content.split(',').map((id: string) => id.trim());
    let final = ""
    for (const paperId of paperIds) {
      const paper = cited_sources?.find((s) => s.paperId === paperId);
      if (!paper) continue;
      const hasManyAuthor = paper.authors && paper.authors.length >= 3;
      const firstAuthor = paper.authors?.[0] ?? "Unknown";
      const lastName = firstAuthor?.name?.split(" ").slice(-1)[0] ?? "Unknown";
      const year = paper.year ?? "n.d.";
      if (hasManyAuthor) {
        final += `(${lastName} et al., ${year})`;
      } else {
        const secondAuthor = paper.authors?.[1];
        if (secondAuthor) {
          const secondLastName = secondAuthor.name?.split(" ").slice(-1)[0] ?? "Unknown";
          final += `(${lastName} & ${secondLastName}, ${year})`;
        } else {
          final += `(${lastName}, ${year})`;
        }
      }
    }

    return final
  });

  const final = buildReferencesSection(formattedText, cited_sources);

  return final;
}

/**
 * Builds the references section for cited papers
 * Returns a string containing the references section
 */
export function buildReferencesSection(
  text?: string,
  cited_sources?: PaperMetadata[],
): string {
  const referencesSection = "##References:\n\n";

  if (!cited_sources || cited_sources.length === 0) {
    return referencesSection + "No references cited.";
  }
  const builtSection = cited_sources.reduce((accStr, source) => {
    accStr += source.citationStyles?.apa
      ? `${source.citationStyles.apa}\n`
      : `${source.title} (${source.paperId})\n`;
    return accStr;
  }, "");

  if (text) {
    return text + "\n\n" + referencesSection + builtSection;
  }
  return referencesSection + builtSection;
}

/**
 * Creates a citation number map for cited papers
 * Returns a map of paperId to citation number (1-indexed)
 */
export function createCitationMap(
  text: string,
  sources?: PaperMetadata[],
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
