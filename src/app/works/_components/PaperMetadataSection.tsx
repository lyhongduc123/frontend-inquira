import { CalendarIcon, UserIcon, BuildingIcon, QuoteIcon } from "lucide-react";

import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { Badge } from "@/components/ui/badge";
import { TypographyH1, TypographyP } from "@/components/global/typography";
import { PaperSource } from "@/types/paper.type";

interface PaperMetadataSectionProps {
  paper: PaperSource;
}

export function PaperMetadataSection({ paper }: PaperMetadataSectionProps) {
  return (
    <VStack className="gap-4">
      {/* Title */}
      <TypographyH1 size="2xl" weight="bold" className="sm:text-4xl">
        {paper.title}
      </TypographyH1>

      {/* Authors */}
      {paper.authors && paper.authors.length > 0 && (
        <HStack className="gap-2 flex-wrap items-center">
          <UserIcon className="size-4 text-muted-foreground shrink-0" />
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {paper.authors.map((author, index) => (
              <TypographyP key={author.authorId} size="sm" className="inline">
                {author.name}
                {index < paper.authors!.length - 1 && ","}
              </TypographyP>
            ))}
          </div>
        </HStack>
      )}

      {/* Metadata Row */}
      <HStack className="gap-4 flex-wrap items-center text-sm text-muted-foreground">
        {paper.year && (
          <HStack className="gap-1.5 items-center">
            <CalendarIcon className="size-4" />
            <TypographyP size="sm" variant="muted">{paper.year}</TypographyP>
          </HStack>
        )}

        {paper.venue && (
          <HStack className="gap-1.5 items-center">
            <BuildingIcon className="size-4" />
            <TypographyP size="sm" variant="muted">{paper.venue}</TypographyP>
          </HStack>
        )}

        {paper.citation_count !== undefined && (
          <HStack className="gap-1.5 items-center">
            <QuoteIcon className="size-4" />
            <TypographyP size="sm" variant="muted">{paper.citation_count.toLocaleString()} citations</TypographyP>
          </HStack>
        )}
      </HStack>

      {/* Badges */}
      <HStack className="gap-2 flex-wrap">
        {paper.source && (
          <Badge variant="outline" className="capitalize">
            {paper.source}
          </Badge>
        )}

        {paper.sjr_data && (
          <>
            <Badge
              variant={
                paper.sjr_data.quartile === "Q1"
                  ? "default"
                  : paper.sjr_data.quartile === "Q2"
                  ? "secondary"
                  : "outline"
              }
            >
              {paper.sjr_data.quartile}
            </Badge>

            <Badge variant="outline">
              SJR: {paper.sjr_data.sjr_score.toFixed(2)}
            </Badge>

            {paper.sjr_data.is_open_access && (
              <Badge variant="secondary">Open Access</Badge>
            )}
          </>
        )}

        {paper.relevance_score && (
          <Badge variant="outline">
            Relevance: {(paper.relevance_score * 100).toFixed(0)}%
          </Badge>
        )}
      </HStack>
    </VStack>
  );
}
