import { BookmarkIcon, ExternalLinkIcon, EyeIcon, QuoteIcon } from "lucide-react";

import { HStack } from "@/components/layout/hstack";
import { Button } from "@/components/ui/button";
import { PaperSource } from "@/types/paper.type";

interface PaperActionBarProps {
  paper: PaperSource;
  isBookmarked: boolean;
  onFulltext: () => void;
  onPeek: () => void;
  onBookmark: () => void;
  onCite: () => void;
}

export function PaperActionBar({
  paper,
  isBookmarked,
  onFulltext,
  onPeek,
  onBookmark,
  onCite,
}: PaperActionBarProps) {
  return (
    <HStack className="gap-2 flex-wrap">
      {/* Fulltext Button */}
      {paper.pdf_url && (
        <Button onClick={onFulltext} variant="default" size="sm">
          <ExternalLinkIcon />
          Full Text
        </Button>
      )}

      {/* Peek Button */}
      {paper.pdf_url && (
        <Button onClick={onPeek} variant="outline" size="sm">
          <EyeIcon />
          Peek
        </Button>
      )}

      {/* Bookmark Button */}
      <Button
        onClick={onBookmark}
        variant={isBookmarked ? "default" : "outline"}
        size="sm"
      >
        <BookmarkIcon className={isBookmarked ? "fill-current" : ""} />
        {isBookmarked ? "Bookmarked" : "Bookmark"}
      </Button>

      {/* Cite Button */}
      <Button onClick={onCite} variant="outline" size="sm">
        <QuoteIcon />
        Cite ({paper.citation_count?.toLocaleString() || 0})
      </Button>
    </HStack>
  );
}
