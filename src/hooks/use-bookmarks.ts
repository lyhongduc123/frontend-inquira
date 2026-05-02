/**
 * React hooks for bookmarks
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookmarksApi, type Bookmark, type CreateBookmarkRequest, type UpdateBookmarkRequest } from "@/lib/api";
import type { BookmarkListParams } from "@/lib/api/bookmarks-api";
import { defaultRetry, defaultRetryDelay, handleMutationError, handleMutationSuccess } from "@/lib/react-query/react-query-utils";
import { useBookmarkStore } from "@/store/bookmark-store";
import { useQueryWithError } from "./use-query-with-error";

export function useBookmarks(params: BookmarkListParams = {}) {
  const {
    skip = 0,
    limit = 50,
    query,
    year,
    isOpenAccess,
    hasNotes,
    sortBy,
    sortOrder,
  } = params;

  const normalizedQuery = query?.trim() || undefined;

  return useQueryWithError({
    queryKey: ["bookmarks", skip, limit, normalizedQuery, year, isOpenAccess, hasNotes, sortBy, sortOrder],
    queryFn: () =>
      bookmarksApi.list({
        skip,
        limit,
        query: normalizedQuery,
        year,
        isOpenAccess,
        hasNotes,
        sortBy,
        sortOrder,
      }),
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
    staleTime: 0,
    refetchOnMount: "always",
  }, 'Failed to load bookmarks');
}

export function useBookmark(bookmarkId: number) {
  return useQueryWithError({
    queryKey: ["bookmark", bookmarkId],
    queryFn: () => bookmarksApi.get(bookmarkId),
    enabled: !!bookmarkId,
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  }, 'Failed to load bookmark');
}

export function useCheckBookmark(paperId: string) {
  return useQueryWithError({
    queryKey: ["bookmark-check", paperId],
    queryFn: () => bookmarksApi.check(paperId),
    enabled: !!paperId,
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  }, 'Failed to check bookmark status');
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookmarkRequest) => bookmarksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["bookmark-check"] });
      handleMutationSuccess("Bookmark added successfully");
    },
    onError: (error) => {
      handleMutationError(error, "add bookmark");
    },
  });
}

export function useUpdateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookmarkId, data }: { bookmarkId: number; data: UpdateBookmarkRequest }) =>
      bookmarksApi.update(bookmarkId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["bookmark", variables.bookmarkId] });
      handleMutationSuccess("Bookmark updated successfully");
    },
    onError: (error) => {
      handleMutationError(error, "update bookmark");
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookmarkId: number) => bookmarksApi.delete(bookmarkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["bookmark-check"] });
      handleMutationSuccess("Bookmark removed successfully");
    },
    onError: (error) => {
      handleMutationError(error, "remove bookmark");
    },
  });
}

export function useToggleBookmark(paperId: string) {
  const isBookmarked = useBookmarkStore((state) => state.isBookmarked(paperId));
  const bookmarkId = useBookmarkStore((state) => state.getBookmarkId(paperId));
  const { addBookmark, removeBookmark } = useBookmarkStore();

  const createMutation = useCreateBookmark();
  const deleteMutation = useDeleteBookmark();

  const toggle = () => {
    if (isBookmarked) {
      if (!bookmarkId) return;
      removeBookmark(paperId);
      
      deleteMutation.mutate(bookmarkId, {
        onError: () => {
          addBookmark(paperId, bookmarkId); 
        }
      });
    } else {
      addBookmark(paperId, -1); 

      createMutation.mutate(
        { paperId }, 
        {
          onSuccess: (data) => {
            addBookmark(paperId, data.id); 
          },
          onError: () => {
            removeBookmark(paperId);
          }
        }
      );
    }
  };

  const isPending = createMutation.isPending || deleteMutation.isPending;

  return { isBookmarked, toggle, isPending };
}