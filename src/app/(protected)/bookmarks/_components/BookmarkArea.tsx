"use client";

import { Bookmark } from "@/lib/api";
import { BookmarkList } from "./BookmarkList";
import {
  Empty,
  EmptyContent,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { bookmarksApi } from "@/lib/api/bookmarks-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BookmarkAreaProps {
  data?: Bookmark[];
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  refetch?: () => void;
}

export function BookmarkArea({
  data,
  isLoading,
  isError,
  isEmpty,
  refetch,
}: BookmarkAreaProps) {
  const router = useRouter();
  const handleRemoveBookmark = async (paperId: string) => {
    const bookmark = data?.find((b) => b.paperId === paperId);
    if (!bookmark) return;

    try {
      await bookmarksApi.delete(bookmark.id);
      toast.success("Bookmark removed successfully");
      refetch?.();
    } catch (error) {
      toast.error("Failed to remove bookmark");
      console.error("Error removing bookmark:", error);
    }
  };

  if (isError) {
    return (
      <Empty>
        <EmptyContent>
          <EmptyTitle className="text-center">
            Failed to load bookmarks. Please try again later.
          </EmptyTitle>
          <EmptyMedia>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="mx-auto mt-4"
            >
              Back previous page
            </Button>
            <Button
              onClick={() => refetch?.()}
              variant="outline"
              className="mx-auto mt-4"
            >
              Retry
            </Button>
          </EmptyMedia>
        </EmptyContent>
      </Empty>
    );
  }

  if (isEmpty || data?.length === 0) {
    return (
      <Empty>
        <EmptyContent>
          <EmptyTitle className="text-center">
            Seem like your bookmarks list is empty. Start adding papers to your
            bookmarks to see them here!
          </EmptyTitle>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <BookmarkList
      isLoading={isLoading}
      data={data || []}
      onRemoveBookmark={handleRemoveBookmark}
    />
  );
}
