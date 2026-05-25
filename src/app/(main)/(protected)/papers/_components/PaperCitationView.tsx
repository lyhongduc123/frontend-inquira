"use client";

import { VStack } from "@/components/layout/vstack";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyP } from "@/components/global/typography";
import type { CitingPaper } from "@/types/paper.type";
import { Skeleton } from "@/components/ui/skeleton";
import { PaperCard } from "./PaperCard";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/app/(main)/_components/LoadingState";
import { Spinner } from "@/components/ui/spinner";
import { OpacityShimmer } from "@/components/ui/opacity-shimmer";
import { HStack } from "@/components/layout/hstack";

interface PaperCitationsViewProps {
  citations: CitingPaper[];
  isLoading?: boolean;
  canLoadMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export function PaperCitationsView({
  citations,
  isLoading = false,
  canLoadMore = false,
  onLoadMore,
  isLoadingMore = false,
}: PaperCitationsViewProps) {
  return (
    <VStack className="gap-6">
      {/* Papers that cite this paper */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Citing papers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <HStack className="items-center gap-2">
              <Spinner className="size-4" />
              <OpacityShimmer>
                Loading citations...
              </OpacityShimmer>
            </HStack>
          ) : citations.length === 0 ? (
            <TypographyP className="text-muted-foreground">
              No citations indexed found for this paper.
            </TypographyP>
          ) : (
            <VStack className="gap-4">
              {citations.map((citation, idx) => (
                <PaperCard key={idx} paper={citation.citingPaper!} idx={idx} />
              ))}
              {canLoadMore && (
                <Button
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  className="w-full"
                >
                  {isLoadingMore ? "Loading..." : "Load more"}
                </Button>
              )}
            </VStack>
          )}
        </CardContent>
      </Card>
    </VStack>
  );
}
