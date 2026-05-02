import { VStack } from "@/components/layout/vstack";
import { PaperMetadata } from "@/types/paper.type";
import { AuthorPaperCard } from "./AuthorPaperCard";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { HStack } from "@/components/layout/hstack";
import { Separator } from "@/components/ui/separator";
import { useDetailSidebar } from "@/hooks/use-detail-sidebar";
import { Loader2 } from "lucide-react";

interface PapersTabsProps {
  papers?: PaperMetadata[];
  totalPapers?: number;
  currentAuthorName?: string;
  isLoading?: boolean;
  isError?: boolean;
  isLoadingMore?: boolean;

  selectedPaperId?: string;
  onView?: (paper: PaperMetadata) => void;
  onLoadMore?: () => void;
}

export function PapersTabs({
  papers,
  totalPapers = 0,
  currentAuthorName,
  isLoading,
  isLoadingMore = false,
  onLoadMore,
  selectedPaperId,
  onView,
}: PapersTabsProps) {
  const { openPaper, content, contentType, closeSidebar } = useDetailSidebar()
  if (isLoading) {
    return <PapersTabsLoading />;
  }

  if (!papers || papers.length === 0) {
    return <PapersTabsEmpty />;
  }

  const sortedPapers = [...papers].sort((a, b) => {
    const dateA = a.publicationDate ? new Date(a.publicationDate).getTime() : 0;
    const dateB = b.publicationDate ? new Date(b.publicationDate).getTime() : 0;
    return dateB - dateA;
  });

  const hasMorePapers = papers.length < totalPapers;

  const handleOnView = (paper: PaperMetadata) =>  {
    onView?.(paper);
  }

  return (
    <VStack className="gap-4 min-w-0">
      {sortedPapers.map((paper, idx) => (
        <AuthorPaperCard
          key={paper.paperId || idx}
          idx={idx + 1}
          paperMetadata={paper}
          currentAuthorName={currentAuthorName}
          onView={handleOnView}
        />
      ))}
      {hasMorePapers && (
        <HStack className="flex items-center gap-4 w-full">
          <Separator className="flex-1" />

          <Button
            variant="outline"
            className="shrink-0 cursor-pointer gap-2"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            Load more ({papers.length} / {totalPapers})
          </Button>

          <Separator className="flex-1" />
        </HStack>
      )}
    </VStack>
  );
}

const PapersTabsLoading = () => {
  return (
    <VStack className="gap-4 min-w-0">
      {Array.from({ length: 5 }).map((_, idx) => (
        <AuthorPaperCard key={idx} isLoading />
      ))}
    </VStack>
  );
};

const PapersTabsEmpty = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle className="text-center">No publications found</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>
          This author has not been associated with any publications in our
          database.
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
};
