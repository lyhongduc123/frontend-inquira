import type { PaperMetadata } from "@/types/paper.type";
import {
  createScopedCitationRefMap,
  getScopedCitationKey,
  getScopedCitationRef,
} from "@/lib/scoped-citation-utils";
import type { ScopedCitationRef } from "@/lib/scoped-citation-utils";
import {
  getSourceFromCitationToken,
  createCitationMap,
} from "./core";

import {
  SCOPED_CITATION_REGEX,
  CITATIONS_REGEX,
  LEGACY_FORMAT_REGEX,
} from "./regex";

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/\"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function convertCitationsToElements(
  text: string,
  sources?: PaperMetadata[],
  scopedQuoteRefs?: ScopedCitationRef[],
) {
  const citationMap = createCitationMap(sources);
  const scopedMap = createScopedCitationRefMap(scopedQuoteRefs);

  let result = text.replace(/(^|[^\w(])cite:([^\s)]+)/g, (_, prefix, token) => {
    return `${prefix}(cite:${token})`;
  });

  result = result.replace(
    SCOPED_CITATION_REGEX,
    (match, paperIdRaw, chunkIdRaw, charStart, charEnd) => {
      const token = paperIdRaw?.trim();
      const chunkId = chunkIdRaw?.trim();

      if (!token || !chunkId) {
        return match;
      }

      const source = getSourceFromCitationToken(token, sources);
      const paperId = source?.paperId;
      if (!paperId) {
        return match;
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

      const scopedRef = getScopedCitationRef(scopedMap, scopedKey, match);
      const quote = escapeHtmlAttribute(scopedRef?.quote ?? "");
      const section = escapeHtmlAttribute(scopedRef?.section ?? "");

      return `<scoped data-id="${paperId}" data-number="${number}" data-chunk-id="${chunkId}" data-char-start="${charStart ?? ""}" data-char-end="${charEnd ?? ""}" data-key="${scopedKey}" data-marker="${match}" data-section="${section}" data-quote="${quote}"/>`;
    },
  );

  result = result.replace(CITATIONS_REGEX, (match, content) => {
    const parts = content.split(",");

    const resolved: Array<{ paperId: string; number: number }> = [];

    for (const p of parts) {
      const token = p.replace("cite:", "").trim();
      const source = getSourceFromCitationToken(token, sources);
      if (!source?.paperId) {
        return match;
      }

      const number = citationMap.get(source.paperId);
      if (number === undefined) {
        return match;
      }

      resolved.push({ paperId: source.paperId, number });
    }

    const rendered = resolved.map(
      ({ paperId, number }) =>
        `<citation data-id="${paperId}" data-number="${number}"/>`,
    );

    return rendered.join("");
  });

  result = result.replace(LEGACY_FORMAT_REGEX, (_match, number, paperId) => {
    return `<citation data-id="${paperId}" data-number="${number}"/>`;
  });

  return result;
}