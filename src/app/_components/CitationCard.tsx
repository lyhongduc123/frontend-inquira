import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PaperSource } from "@/types/paper.type";
import { ExternalLink, FileText } from "lucide-react";

interface CitationCardProps {
  isVisible: boolean;
  paperDetail?: PaperSource;
}

export function CitationCard({ paperDetail }: CitationCardProps) {
  if (!paperDetail) return null;

  const hasFullText = !!paperDetail.pdf_url;
  const displayUrl = hasFullText ? paperDetail.pdf_url : paperDetail.url;
  const authors = paperDetail?.authors ?? [];

  return (
    <Card className="shadow-lg max-w-6xl">
      <CardHeader className="pb-1">
        <CardTitle className="font-semibold leading-tight line-clamp-3">
          {paperDetail.title}
        </CardTitle>
        {authors.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            {authors
              .slice(0, 3)
              .map((a) => a.name)
              .join(", ")}
          </p>
        )}
        <div className="flex gap-2 text-xs text-muted-foreground mt-1">
          {paperDetail.year && <span>{paperDetail.year}</span>}
          {paperDetail.venue && (
            <>
              {paperDetail.year && <span>•</span>}
              <span className="line-clamp-1">{paperDetail.venue}</span>
            </>
          )}
        </div>
      </CardHeader>

      {displayUrl && (
        <CardFooter className="pt-1 border-t">
          <Button
            onClick={() => {
              window.open(displayUrl, "_blank");
            }}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm hover:underline transition-colors"
          >
            {hasFullText ? (
              <>
                <FileText className="w-4 h-4" />
                View Full-Text
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                View Paper
              </>
            )}
          </Button>
          {paperDetail.citation_count !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground">
              {paperDetail.citation_count} citations
            </span>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
