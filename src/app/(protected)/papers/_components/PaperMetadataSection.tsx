import { CalendarIcon, UserIcon, BuildingIcon, QuoteIcon } from "lucide-react";

import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { Badge } from "@/components/ui/badge";
import { TypographyH1, TypographyP } from "@/components/global/typography";
import type { PaperDetail } from "@/types/paper.type";
import { Skeleton } from "@/components/ui/skeleton";

interface PaperMetadataSectionProps {
  paper: PaperDetail;
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
              <TypographyP key={author.authorId || author.name} size="sm" className="inline">
                {author.name}
                {index < paper.authors!.length - 1 && ","}
              </TypographyP>
            ))}
          </div>
        </HStack>
      )}

      {/* Metadata Row */}
      <HStack className="gap-4 flex-wrap items-center text-sm text-muted-foreground">
        {paper.publicationDate && (
          <HStack className="gap-1.5 items-center">
            <CalendarIcon className="size-4" />
            <TypographyP size="sm" variant="muted">
              {new Date(paper.publicationDate).getFullYear()}
            </TypographyP>
          </HStack>
        )}

        {paper.venue && (
          <HStack className="gap-1.5 items-center">
            <BuildingIcon className="size-4" />
            <TypographyP size="sm" variant="muted">{paper.venue}</TypographyP>
          </HStack>
        )}

        {paper.citationCount !== undefined && (
          <HStack className="gap-1.5 items-center">
            <QuoteIcon className="size-4" />
            <TypographyP size="sm" variant="muted">{paper.influentialCitationCount.toLocaleString()} influential</TypographyP>
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

        {paper.sjrData && (
          <>
            <Badge
              variant={
                paper.sjrData.quartile === "Q1"
                  ? "default"
                  : paper.sjrData.quartile === "Q2"
                  ? "secondary"
                  : "outline"
              }
            >
              {paper.sjrData.quartile}
            </Badge>

            <Badge variant="outline">
              SJR: {paper.sjrData.sjrScore.toFixed(2)}
            </Badge>

            {paper.sjrData.percentile && (
              <Badge variant="outline">
                Top {(100 - paper.sjrData.percentile).toFixed(0)}%
              </Badge>
            )}
          </>
        )}

        {paper.isOpenAccess ? (
          <Badge variant="secondary">Open Access</Badge>
        ) : (
          <Badge variant="destructive">Closed Access</Badge>
        )}

        {paper.isRetracted && (
          <Badge variant="destructive">Retracted</Badge>
        )}

        {paper.fwci !== null && paper.fwci !== undefined && (
          <Badge variant="default">
            FWCI: {paper.fwci.toFixed(2)}
          </Badge>
        )}

        {paper.authorTrustScore !== null && paper.authorTrustScore !== undefined && (
          <Badge variant="outline">
            Author Trust: {(paper.authorTrustScore * 100).toFixed(0)}%
          </Badge>
        )}

        {paper.isProcessed && (
          <Badge variant="secondary">Processed</Badge>
        )}
      </HStack>
    </VStack>
  );
}

export function PaperMetadataSectionSkeleton() {
  return (
    <VStack className="space-y-3">
      <Skeleton className="h-8 w-3/4" /> {/* title */}
      <Skeleton className="h-4 w-1/2" /> {/* authors */}
      <Skeleton className="h-4 w-1/3" /> {/* venue/year */}
    </VStack>
  );
}
