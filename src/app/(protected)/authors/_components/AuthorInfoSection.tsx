import { TypographyH2, TypographyP } from "@/components/global/typography";
import { Box } from "@/components/layout/box";
import { HStack } from "@/components/layout/hstack";
import { VStack } from "@/components/layout/vstack";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthorDetail, AuthorDetailWithPapers } from "@/types/author.type";
import {
  Award,
  CheckCircle2,
  ExternalLink,
  User,
  Globe,
  HomeIcon,
  UniversityIcon,
} from "lucide-react";
import Link from "next/link";

interface AuthorInfoSectionProps {
  author?: AuthorDetailWithPapers;
  isLoading?: boolean;
}

export function AuthorInfoSection({
  author,
  isLoading,
}: AuthorInfoSectionProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden border-2 shadow-lg transition-all hover:shadow-xl">
        <CardContent className="p-6">
          <HStack className="gap-6 items-start">
            <Skeleton className="size-20 shrink-0 rounded-full" />
            <VStack className="gap-4 flex-1 w-full">
              <Skeleton className="h-6 w-1/3 rounded-md" />
              <Skeleton className="h-4 w-1/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </VStack>
          </HStack>
        </CardContent>
      </Card>
    );
  }
  console.log("Author details:", author);
  const displayName = author?.displayName || author?.name;
  const uniqueFields = [
    ...new Map(
      author?.topics?.map((item) => [item.field.id, item.field.displayName]),
    ).values(),
  ];

  const sortedInstitutions = [...(author?.authorInstitutions || [])].sort(
    (a, b) => {
      const dateA = a.endDate ? new Date(a.endDate).getTime() : Infinity;
      const dateB = b.endDate ? new Date(b.endDate).getTime() : Infinity;
      return dateA - dateB;
    },
  );

  return (
    <Card className="overflow-hidden border-2 shadow-lg transition-all hover:shadow-xl">
      <CardContent className="p-6">
        <HStack className="gap-6 items-start">
          <div className="relative">
            <Avatar className="size-20 ring-4 ring-primary/10 shadow-md">
              <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-yellow-600 text-white">
                {author?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <VStack className="gap-4 flex-1">
            <HStack className="gap-6 items-center justify-between">
              <VStack className="gap-2">
                <HStack className="gap-3 items-center flex-wrap">
                  <TypographyH2 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    {displayName}
                  </TypographyH2>
                  {author?.verified && (
                    <Badge className="gap-1.5 px-3 py-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified
                    </Badge>
                  )}
                </HStack>
                {sortedInstitutions.length > 0 && (
                  <HStack className="gap-2 items-center flex-wrap">
                    <UniversityIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <TypographyP size="sm" variant="muted">
                      {sortedInstitutions[0].name}
                    </TypographyP>
                  </HStack>
                )}
                {author?.orcid && (
                  <HStack className="gap-2 items-center px-3 py-1.5 bg-muted/50 rounded-md w-fit">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <TypographyP
                      size="sm"
                      variant="muted"
                      className="font-mono"
                    >
                      ORCID: {author?.orcid}
                    </TypographyP>
                  </HStack>
                )}
              </VStack>
              <VStack className="gap-3 items-start">
                <AuthorLink
                  href={author?.homepageUrl || ""}
                  text="Homepage"
                  icon={<HomeIcon className="size-3.5" />}
                />
                <AuthorLink
                  href={author?.url || ""}
                  text="Semantic Scholar"
                  icon={<ExternalLink className="size-3.5" />}
                />
              </VStack>
            </HStack>
            {uniqueFields.length > 0 && (
              <HStack className="gap-2 flex-wrap">
                <TypographyP
                  size="xs"
                  variant="muted"
                  className="font-semibold"
                >
                  Research Fields:
                </TypographyP>
                {uniqueFields.map((field, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs px-2 py-0.5"
                  >
                    {field}
                  </Badge>
                ))}
              </HStack>
            )}
          </VStack>
        </HStack>
      </CardContent>
    </Card>
  );
}

const AuthorLink = ({
  href,
  text,
  icon,
}: {
  href: string;
  text: string;
  icon?: React.ReactNode;
}) => {
  if (!href) return null;
  return (
    <Button variant="link" size="sm" className="gap-1.5 text-primary-foreground" asChild>
      <a href={href} target="_blank" rel="noopener noreferrer">
        {icon}
        <span className="group-hover:underline">{text}</span>
      </a>
    </Button>
  );
};
