import { CoAuthorDTO } from "@/types/author.type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VStack } from "@/components/layout/vstack";
import { TypographyP } from "@/components/global/typography";
import { AuthorItem, AuthorItemSkeleton } from "./AuthorItem";
import { Aladin } from "next/font/google";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface CoAuthorsListProps {
  authorId: string;
  coAuthors?: CoAuthorDTO[];
  isLoading?: boolean;
}

export function CoAuthorsTabs({ authorId, coAuthors, isLoading }: CoAuthorsListProps) {
  if (isLoading) {
    return <CoAuthorsTabsSkeleton />;
  }

  if (!coAuthors || coAuthors.length === 0) {
    return (
      <Card className="border-0 bg-background">
        <CardHeader>
          <CardTitle>Co-Authors</CardTitle>
        </CardHeader>
        <CardContent>
          <TypographyP className="text-center text-muted-foreground">
            No co-authors found for this author.
          </TypographyP>
        </CardContent>
      </Card>
    );
  }
  return (
    <VStack className="gap-4">
      {coAuthors.map((author) => (
        <AuthorItem key={author.authorId} author={author} />
      ))}
      <Alert variant="info" className="w-full">
        <InfoIcon className="size-4" />
        <AlertDescription>
          We display up to 10 co-authors based on the number of shared publications. For a better overview, visit author page at {<a href={`https://www.semanticscholar.org/author/${authorId}`} target="_blank" rel="noopener noreferrer">Semantic Scholar</a>}.
        </AlertDescription>
      </Alert>
    </VStack>
  );
}

export function CoAuthorsTabsSkeleton() {
  return (
    <VStack className="gap-4">
      {[1, 2, 3].map((idx) => (
        <AuthorItemSkeleton key={idx} />
      ))}
    </VStack>
  );
}
