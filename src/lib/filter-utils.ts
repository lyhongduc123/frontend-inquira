/**
 * Utility functions for transforming search filters between frontend and backend formats
 */

import { SearchFilters } from "@/app/_components/FilterPanel";

/**
 * Transform frontend filter format to backend expected format
 * 
 * Frontend uses UI-focused filter state (including `yearRange` and legacy aliases)
 * Chat submit API accepts camelCase payload keys, then backend normalizes internally.
 */
export function transformFiltersForBackend(filters?: SearchFilters): Record<string, unknown> | undefined {
  if (!filters) return undefined;

  const transformed: Record<string, unknown> = {};

  // Transform yearRange to yearMin/yearMax
  if (filters.yearRange) {
    if (filters.yearRange.min !== undefined) {
      transformed.yearMin = filters.yearRange.min;
    }
    if (filters.yearRange.max !== undefined) {
      transformed.yearMax = filters.yearRange.max;
    }
  }

  // Direct mappings for chat submit filter schema
  if (filters.author_name || filters.author) transformed.authorName = filters.author_name || filters.author;
  if (filters.year_min !== undefined) transformed.yearMin = filters.year_min;
  if (filters.year_max !== undefined) transformed.yearMax = filters.year_max;
  if (filters.venue) transformed.venue = filters.venue;
  if (filters.min_citation_count !== undefined || filters.min_citations !== undefined) {
    transformed.minCitationCount = filters.min_citation_count ?? filters.min_citations;
  }
  if (filters.max_citation_count !== undefined || filters.max_citations !== undefined) {
    transformed.maxCitationCount = filters.max_citation_count ?? filters.max_citations;
  }
  if (filters.journal_quartile) transformed.journalQuartile = filters.journal_quartile;

  const selectedFields = filters.field_of_study ?? filters.category;
  if (selectedFields && selectedFields.length > 0) {
    transformed.fieldOfStudy = selectedFields;
  }

  return Object.keys(transformed).length > 0 ? transformed : undefined;
}

/**
 * Check if filters object has any active filters
 */
export function hasActiveFilters(filters?: SearchFilters): boolean {
  if (!filters) return false;

  return (
    Boolean(filters.author_name || filters.author) ||
    Boolean(filters.venue) ||
    (filters.yearRange?.min !== undefined || filters.yearRange?.max !== undefined) ||
    (filters.year_min !== undefined || filters.year_max !== undefined) ||
    (filters.min_citation_count !== undefined || filters.max_citation_count !== undefined) ||
    (filters.min_citations !== undefined || filters.max_citations !== undefined) ||
    (filters.field_of_study && filters.field_of_study.length > 0) ||
    (filters.category && filters.category.length > 0) ||
    Boolean(filters.journal_quartile) ||
    filters.openAccessOnly === true ||
    filters.excludePreprints === true ||
    filters.topJournalsOnly === true
  );
}
