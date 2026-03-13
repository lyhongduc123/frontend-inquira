import { VStack } from "@/components/layout/vstack";
import { PaperMetadata } from "@/types/paper.type";
import { AuthorPaperCard } from "./AuthorPaperCard";

interface PapersTabsProps {
  papers?: PaperMetadata[];
  currentAuthorName?: string;
}

export function PapersTabs({ papers, currentAuthorName }: PapersTabsProps) {
  if (!papers || papers.length === 0) {
    return (
      <VStack className="gap-4 min-w-0">
        <div className="border-2 border-dashed rounded-lg p-12 w-full text-center">
          <p className="text-muted">No publications found for this author.</p>
        </div>
      </VStack>
    );
  }
  const sortedPapers = [...papers].sort((a, b) => {
    const dateA = a.publicationDate ? new Date(a.publicationDate).getTime() : 0;
    const dateB = b.publicationDate ? new Date(b.publicationDate).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <VStack className="gap-4 min-w-0">
      {sortedPapers.map((paper, idx) => (
        <AuthorPaperCard
          key={paper.paperId || idx}
          idx={idx + 1}
          paperMetadata={paper}
          currentAuthorName={currentAuthorName}
        />
      ))}
    </VStack>
  );
}
