import { CoAuthor } from "@/types/author.type";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { TypographyP } from "@/components/global/typography";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Award, Quote, Users } from "lucide-react";
import Link from "next/link";
import { AuthorItem } from "./AuthorItem";

interface CoAuthorsListProps {
  coAuthors?: CoAuthor[];
}

export function CoAuthorsTabs({ coAuthors }: CoAuthorsListProps) {
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
    )
  }
  return (
    <VStack className="gap-4">
      {coAuthors.map((author) => (
        <AuthorItem key={author.authorId} author={author} />
      ))}
    </VStack>
  );
}
