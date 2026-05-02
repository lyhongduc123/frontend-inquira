import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SearchFilters } from "@/app/_components/FilterPanel";
import { usePipelineStore } from "@/store/pipeline-store";

/**
 * Hook to manage search filters via URL parameters
 * and chat pipeline mode via global store.
 */
export function useSearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const persistedPipeline = usePipelineStore((state) => state.pipeline);
  const hasHydrated = usePipelineStore((state) => state.hasHydrated);
  const setPipeline = usePipelineStore((state) => state.setPipeline);
  const pipeline: "research" | "agent" = hasHydrated
    ? persistedPipeline
    : "research";

  const filters = useMemo((): SearchFilters => {
    const f: SearchFilters = {};

    const authorName = searchParams.get("author_name") || searchParams.get("author");
    if (authorName) {
      f.author_name = authorName;
      f.author = authorName;
    }

    const yearMin = searchParams.get("year_min");
    if (yearMin) f.year_min = parseInt(yearMin, 10);

    const yearMax = searchParams.get("year_max");
    if (yearMax) f.year_max = parseInt(yearMax, 10);

    const venue = searchParams.get("venue");
    if (venue) f.venue = venue;

    const minCitations = searchParams.get("min_citation_count") || searchParams.get("min_citations");
    if (minCitations) {
      const parsed = parseInt(minCitations, 10);
      f.min_citation_count = parsed;
      f.min_citations = parsed;
    }

    const maxCitations = searchParams.get("max_citation_count") || searchParams.get("max_citations");
    if (maxCitations) {
      const parsed = parseInt(maxCitations, 10);
      f.max_citation_count = parsed;
      f.max_citations = parsed;
    }

    const journalQuartile = searchParams.get("journal_quartile") || searchParams.get("journal_rank");
    if (journalQuartile && ["Q1", "Q2", "Q3", "Q4"].includes(journalQuartile)) {
      f.journal_quartile = journalQuartile as "Q1" | "Q2" | "Q3" | "Q4";
    }

    const fields =
      searchParams.get("field_of_study")?.split(",").filter(Boolean)
      || searchParams.get("fields_of_study")?.split(",").filter(Boolean)
      || searchParams.get("category")?.split(",").filter(Boolean);
    if (fields && fields.length > 0) {
      f.field_of_study = fields;
      f.category = fields;
    }

    const openAccess = searchParams.get("open_access");
    if (openAccess === "true") f.openAccessOnly = true;

    const excludePreprints = searchParams.get("exclude_preprints");
    if (excludePreprints === "true") f.excludePreprints = true;

    const topJournals = searchParams.get("top_journals");
    if (topJournals === "true") f.topJournalsOnly = true;

    // Handle legacy yearRange for UI compatibility if needed
    if (f.year_min !== undefined || f.year_max !== undefined) {
      f.yearRange = {
        min: f.year_min,
        max: f.year_max,
      };
    }

    return f;
  }, [searchParams]);

  useEffect(() => {
    const legacyModeParam = searchParams.get("mode");
    if (legacyModeParam === "agent" || legacyModeParam === "research") {
      if (legacyModeParam !== persistedPipeline) {
        setPipeline(legacyModeParam);
      }
    }
  }, [persistedPipeline, searchParams, setPipeline]);

  const setParams = useCallback(
    (newFilters: SearchFilters, newPipeline?: "research" | "agent") => {
      const params = new URLSearchParams(searchParams.toString());

      // Helper to set or delete param
      const updateParam = (key: string, value: unknown) => {
        if (value !== undefined && value !== null && value !== "" && value !== false) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      };

      updateParam("author_name", newFilters.author_name ?? newFilters.author);
      
      // Prefer yearRange if it exists, otherwise use flat fields
      const yearMin = newFilters.yearRange?.min ?? newFilters.year_min;
      const yearMax = newFilters.yearRange?.max ?? newFilters.year_max;
      updateParam("year_min", yearMin);
      updateParam("year_max", yearMax);

      updateParam("venue", newFilters.venue);
      updateParam("min_citation_count", newFilters.min_citation_count ?? newFilters.min_citations);
      updateParam("max_citation_count", newFilters.max_citation_count ?? newFilters.max_citations);
      updateParam("journal_quartile", newFilters.journal_quartile);
      
      const selectedFields = newFilters.field_of_study ?? newFilters.category;
      if (selectedFields && selectedFields.length > 0) {
        params.set("field_of_study", selectedFields.join(","));
      } else {
        params.delete("field_of_study");
      }

      updateParam("open_access", newFilters.openAccessOnly);
      updateParam("exclude_preprints", newFilters.excludePreprints);
      updateParam("top_journals", newFilters.topJournalsOnly);

      if (params.has("mode")) {
        params.delete("mode");
      }

      if (newPipeline) {
        setPipeline(newPipeline);
      }

      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
    },
    [pathname, router, searchParams, setPipeline]
  );

  const clearFilters = useCallback(() => {
    setParams({}, pipeline);
  }, [setParams, pipeline]);

  return {
    filters,
    pipeline,
    setParams,
    clearFilters,
  };
}
