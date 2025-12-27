import { HStack } from "@/components/layout/hstack";
import { VStack } from "@/components/layout/vstack";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Author } from "@/types/paper.type";
import {
  ExternalLink,
  BookOpen,
  Users,
  Calendar,
  Quote,
  Zap,
  Lock,
  FileText,
} from "lucide-react";

interface PaperCardProps {
  title: string;
  url: string;
  snippet?: string;
  authors?: Author[];
  year?: number;
  venue?: string;
  abstract?: string;
  citation_count?: number;
  influential_citation_count?: number;
  rank?: number;
  pdf_url?: string;
}

export function PaperCard({
  title,
  url,
  snippet,
  authors,
  year,
  venue,
  abstract,
  citation_count,
  influential_citation_count,
  rank,
  pdf_url,
}: PaperCardProps) {
  const displayText = snippet || abstract;

  const formatAuthors = (authorsArr: Author[]) => {
    if (!authorsArr?.length) return "";
    if (authorsArr.length <= 3) {
      return authorsArr.map((author) => author.name).join(", ");
    }
    const authorsArray = authorsArr.slice(0, 3).map((author) => author.name);
    const remainingCount = authorsArr.length - 3;
    const lastAuthor = authorsArr[authorsArr.length - 1].name;
    return `${authorsArray.join(
      ", "
    )} … ${lastAuthor} (+${remainingCount} more)`;
  };

  const citationLevel = () => {
    if (citation_count === undefined || citation_count === 0) return null;
    if (citation_count > 500) return "HIGHLY CITED";
    if (citation_count > 100) return "MODERATELY CITED";
    return null;
  };

  const influentialLevel = () => {
    if (influential_citation_count === undefined || influential_citation_count === 0) return null;
    if (influential_citation_count > 50) return "HIGHLY INFLUENTIAL";
    if (influential_citation_count > 10) return "MODERATELY INFLUENTIAL";
    return null;
  };

  return (
    <Card className="transition gap-1 relative p-3">
      {rank !== undefined && (
        <div className="absolute left-0 top-0 h-full w-[4px] bg-gradient-to-b from-primary to-primary/40" />
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 relative">
        {rank !== undefined && (
          <div className="absolute -top-2 -left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            #{rank}
          </div>
        )}

        <CardTitle className="text-sm font-medium flex-1">
          <div className="flex items-center gap-1">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 hover:underline line-clamp-1 pr-2"
            >
              {title}
            </a>
            
            {/* Access Link Card */}
            <a
              href={pdf_url || url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 hover:bg-primary/20 rounded transition-colors shrink-0"
            >
              {pdf_url ? (
                <>
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-semibold">PDF</span>
                </>
              ) : url.includes("semanticscholar") ? (
                <>
                  <Lock className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold">PDF</span>
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-xs font-semibold">PDF</span>
                </>
              )}
            </a>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        <VStack className="w-full">
          <VStack className="flex-1 w-full">
            {/* Authors and Year */}
            {authors && (
              <div className="flex items-center gap-3 text-sm text-accent flex-wrap">
                <div className="flex items-center gap-1 min-w-0">
                  <Users className="h-4 w-4 -translate-y-0.5 shrink-0" />
                  <span className="line-clamp-1">{formatAuthors(authors)}</span>
                </div>
              </div>
            )}

            {/* Abstract/Snippet */}
            {displayText ? (
              <p className="text-xs text-muted-foreground line-clamp-3 mt-1">
                {displayText}
              </p>
            ) : (
              <p className="text-xs text-accent italic mt-1">
                No abstract available.
              </p>
            )}

            {/* Citation Levels */}
            {(citationLevel() || influentialLevel()) && (
              <HStack className="mt-2">
                {citationLevel() && (
                  <Badge variant="secondary" className="font-bold h-6 text-xs px-2">
                    <Quote className="h-3 w-3 fill-green-600 text-green-600" />
                    <span className="font-semibold">{citationLevel()}</span>{" "}
                  </Badge>
                )}
                {influentialLevel() && (
                  <Badge variant="default" className="font-bold h-6 text-xs px-2">
                    <Zap className="h-3 w-3 fill-amber-700 text-amber-700" />
                    <span className="font-semibold">{influentialLevel()}</span>{" "}
                  </Badge>
                )}
              </HStack>
            )}
          </VStack>

          {/* Bottom: Venue and Citation Text - Horizontal */}
          {(year || venue || citation_count || influential_citation_count) && (
            <HStack className="flex-wrap gap-4 items-center text-xs border-t pt-2 mt-2 w-full">
              {year && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 -translate-y-0.5" />
                  <span className="font-semibold">{year}</span>
                </span>
              )}

              {citation_count !== undefined && (
                <span>
                  <span className="font-semibold">{citation_count}</span>{" "}
                  <span className="text-muted-foreground">citations</span>
                </span>
              )}

              {influential_citation_count !== undefined &&
                influential_citation_count > 0 && (
                  <span>
                    <span className="font-semibold">
                      {influential_citation_count}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      influential citations
                    </span>
                  </span>
                )}

              {venue && (
                <HStack className="text-muted-foreground items-center gap-1">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{venue}</span>
                </HStack>
              )}
            </HStack>
          )}
        </VStack>
      </CardContent>
    </Card>
  );
}
