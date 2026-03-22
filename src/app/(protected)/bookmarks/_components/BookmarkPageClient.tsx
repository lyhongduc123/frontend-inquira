"use client";

import { BookmarkSearchBar } from "./BookmarkSearchBar";
import { BookmarkArea } from "./BookmarkArea";
import { Bookmark } from "@/lib/api";
import { useState, useMemo } from "react";
import { VStack } from "@/components/layout/vstack";
import { useBookmarks } from "@/hooks/use-bookmarks";

export function BookmarkPageClient() {
  const { data: bookmarks, isLoading, isError, refetch } = useBookmarks();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookmarks = useMemo(() => {
    if (!bookmarks?.items) return [];
    if (!searchQuery.trim()) return bookmarks.items;

    const query = searchQuery.toLowerCase();
    return bookmarks.items.filter((bookmark: Bookmark) => {
      const paper = bookmark.paper;
      if (!paper) return false;

      if (paper.title?.toLowerCase().includes(query)) return true;
      if (
        paper.authors?.some((author) =>
          author.name?.toLowerCase().includes(query),
        )
      )
        return true;

      if (paper.venue?.toLowerCase().includes(query)) return true;
      if (bookmark.notes?.toLowerCase().includes(query)) return true;

      return false;
    });
  }, [bookmarks, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <VStack className="w-full max-w-8xl p-8 gap-4 items-center">
      <BookmarkSearchBar onSearch={handleSearch} />
      <BookmarkArea
        data={filteredBookmarks}
        isLoading={isLoading}
        isError={isError}
        isEmpty={!filteredBookmarks.length && !searchQuery}
        refetch={refetch}
      />
    </VStack>
  );
}
