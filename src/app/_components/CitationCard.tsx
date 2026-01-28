import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PaperSource } from "@/types/paper.type";
import { ExternalLink, FileText } from "lucide-react";
import { TypographyP } from "@/components/global/typography";
import { HStack } from "@/components/layout/hstack";

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
    <Card className="max-w-6xl shadow-lg">
      <CardHeader className="pb-1">
        <CardTitle className="line-clamp-3 font-semibold leading-tight">
          {paperDetail.title}
        </CardTitle>
        {authors.length > 0 && (
          <TypographyP variant="muted" size="xs" className="mt-2">
            {authors
              .slice(0, 3)
              .map((a) => a.name)
              .join(", ")}
          </TypographyP>
        )}
        <HStack className="mt-1 gap-2 text-xs text-muted-foreground">
          {paperDetail.year && <span>{paperDetail.year}</span>}
          {paperDetail.venue && (
            <>
              {paperDetail.year && <span>•</span>}
              <span className="line-clamp-1">{paperDetail.venue}</span>
            </>
          )}
        </HStack>
      </CardHeader>

      {displayUrl && (
        <CardFooter className="border-t pt-1">
          <Button
            onClick={() => {
              window.open(displayUrl, "_blank");
            }}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm transition-colors hover:underline"
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
