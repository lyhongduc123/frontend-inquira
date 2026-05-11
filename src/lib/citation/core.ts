import type { PaperMetadata } from "@/types/paper.type";
import { extractScopedCitationRefs } from "@/lib/scoped-citation-utils";

export function getSourceFromCitationToken(
  token: string,
  sources?: PaperMetadata[],
): PaperMetadata | undefined {
  if (!sources?.length) return undefined;

  const normalized = token.trim();
  if (!normalized) return undefined;

  const direct = sources.find(s => s.paperId === normalized);
  if (direct) return direct;

  if (/^\d+$/.test(normalized)) {
    const idx = Number(normalized);
    if (idx >= 0 && idx < sources.length) return sources[idx];

    const oneBased = idx - 1;
    if (oneBased >= 0 && oneBased < sources.length) return sources[oneBased];
  }

  return undefined;
}

export function extractCitedPaperIds(text: string): string[] {
  const cited = new Set<string>();

  for (const ref of extractScopedCitationRefs(text)) {
    cited.add(ref.paperId);
  }

  for (const match of text.matchAll(/cite:([^,\)\s]+)/g)) {
    cited.add(match[1].split("|")[0]);
  }

  for (const match of text.matchAll(/\[\d+\]\(([^)]+)\)/g)) {
    cited.add(match[1]);
  }

  return [...cited];
}

export function getCitedPapers(
  text: string,
  sources?: PaperMetadata[],
): PaperMetadata[] {
  if (!sources?.length) return [];

  const citedIds = new Set<string>();

  for (const token of extractCitedPaperIds(text)) {
    const source = getSourceFromCitationToken(token, sources);
    if (source?.paperId) {
      citedIds.add(source.paperId);
    }
  }

  return sources.filter(
    (source) => source.paperId && citedIds.has(source.paperId),
  );
}

export function createCitationMap(
  sources?: PaperMetadata[],
): Map<string, number> {
  const map = new Map<string, number>();
  sources?.forEach((s, i) => {
    if (s.paperId) map.set(s.paperId, i + 1);
  });
  return map;
}