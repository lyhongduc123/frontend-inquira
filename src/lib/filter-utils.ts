/**
 * Utility functions for transforming search filters between frontend and backend formats
 */

import { SearchFilters } from "@/app/_components/FilterPanel";

/**
 * Transform frontend filter format to backend expected format
 * 
 * Frontend uses camelCase and nested objects (yearRange)
 * Backend expects snake_case and flat structure (year_min, year_max)
 */
export function transformFiltersForBackend(filters?: SearchFilters): Record<string, unknown> | undefined {
  if (!filters) return undefined;

  const transformed: Record<string, unknown> = {};

  // Transform yearRange to year_min/year_max
  if (filters.yearRange) {
    if (filters.yearRange.min !== undefined) {
      transformed.year_min = filters.yearRange.min;
    }
    if (filters.yearRange.max !== undefined) {
      transformed.year_max = filters.yearRange.max;
    }
  }

  // Direct mappings for snake_case fields (if they exist in filters)
  if (filters.author) transformed.author = filters.author;
  if (filters.year_min !== undefined) transformed.year_min = filters.year_min;
  if (filters.year_max !== undefined) transformed.year_max = filters.year_max;
  if (filters.venue) transformed.venue = filters.venue;
  if (filters.min_citations !== undefined) transformed.min_citations = filters.min_citations;
  if (filters.max_citations !== undefined) transformed.max_citations = filters.max_citations;

  // TODO: Map frontend-specific filters to backend equivalents
  // - category -> venue or other field?
  // - openAccessOnly -> needs backend support
  // - excludePreprints -> needs backend support
  // - topJournalsOnly -> needs backend support

  return Object.keys(transformed).length > 0 ? transformed : undefined;
}

/**
 * Check if filters object has any active filters
 */
export function hasActiveFilters(filters?: SearchFilters): boolean {
  if (!filters) return false;

  return (
    Boolean(filters.author) ||
    Boolean(filters.venue) ||
    (filters.yearRange?.min !== undefined || filters.yearRange?.max !== undefined) ||
    (filters.year_min !== undefined || filters.year_max !== undefined) ||
    (filters.min_citations !== undefined || filters.max_citations !== undefined) ||
    (filters.category && filters.category.length > 0) ||
    filters.openAccessOnly === true ||
    filters.excludePreprints === true ||
    filters.topJournalsOnly === true
  );
}
