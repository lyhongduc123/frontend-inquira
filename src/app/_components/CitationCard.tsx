import { TypographyP } from "@/components/global/typography";
import { Box } from "@/components/layout/box";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { C_BULLET } from "@/core";
import type { PaperMetadata } from "@/types/paper.type";

interface CitationCardProps {
  isVisible: boolean;
  paperDetail?: PaperMetadata;
}

export function CitationCard({ isVisible, paperDetail }: CitationCardProps) {
  if (!isVisible || !paperDetail) return null;

  const authors = paperDetail?.authors ?? [];

  return (
    <Card>
      <CardContent>
        <CardTitle className="text-base font-semibold line-clamp-2">
          {paperDetail.title}
        </CardTitle>
        {authors.length > 0 && (
          <TypographyP className="text-sm text-muted-foreground line-clamp-1">
            {authors[0].name + (authors.length > 1 ? `, et al.` : "")}
          </TypographyP>
        )}
        <TypographyP className="text-xs text-muted-foreground">
          {paperDetail.venue}
        </TypographyP>
        {paperDetail.tldr && (
          <TypographyP className="text-xs text-muted-foreground line-clamp-2">
            <span className="text-accent">SUMMARY: </span>
            {paperDetail.tldr || ""}
          </TypographyP>
        )}
      </CardContent>
    </Card>
  );
}
