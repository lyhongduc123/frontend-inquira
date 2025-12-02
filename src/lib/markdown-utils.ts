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
 */
export function convertCitationsToElements(
  text: string,
  getSourceById: (id: string) => boolean
): string {
  return text.replace(/\[(\d+)\]\(([^)]+)\)/g, (match, number, paperId) => {
    if (!getSourceById(paperId)) {
      return `[${number}]`;
    }
    return `<citation data-id="${paperId}" data-number="${number}"></citation>`;
  });
}
