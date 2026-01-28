import { HStack } from "@/components/layout/hstack";
import { VStack } from "@/components/layout/vstack";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Author, SJRData } from "@/types/paper.type";
import { TypographyP } from "@/components/global/typography";
import {
  ExternalLink,
  BookOpen,
  Users,
  Calendar,
  Quote,
  Zap,
  Lock,
  FileText,
  Award,
  TrendingUp,
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
  sjr_data?: SJRData;
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
  sjr_data,
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
    <Card className="relative gap-1 p-3 transition">
      {rank !== undefined && (
        <div className="absolute left-0 top-0 h-full w-[4px] bg-linear-to-b from-primary to-primary/40" />
      )}

      <CardHeader className="relative flex flex-row items-center justify-between space-y-0">
        {rank !== undefined && (
          <div className="absolute -left-2 -top-2 rounded-full bg-primary px-2 py-1 text-xs font-bold text-white shadow">
            #{rank}
          </div>
        )}

        <CardTitle className="flex-1 text-sm font-medium">
          <HStack className="items-center gap-1">
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
              className="flex shrink-0 items-center gap-1.5 rounded bg-primary/10 px-2.5 py-1 transition-colors hover:bg-primary/20"
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
          </HStack>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        <VStack className="w-full">
          <VStack className="flex-1 w-full">
            {/* Authors and Year */}
            {authors && (
              <HStack className="flex-wrap items-center gap-3 text-sm text-accent">
                <HStack className="min-w-0 items-center gap-1">
                  <Users className="h-4 w-4 shrink-0 -translate-y-0.5" />
                  <span className="line-clamp-1">{formatAuthors(authors)}</span>
                </HStack>
              </HStack>
            )}

            {/* Abstract/Snippet */}
            {displayText ? (
              <TypographyP variant="muted" size="xs" className="mt-1 line-clamp-3">
                {displayText}
              </TypographyP>
            ) : (
              <TypographyP variant="accent" size="xs" className="mt-1 italic">
                No abstract available.
              </TypographyP>
            )}

            {/* Citation Levels */}
            {(citationLevel() || influentialLevel()) && (
              <HStack className="mt-2">
                {citationLevel() && (
                  <Badge variant="secondary" className="h-6 px-2 text-xs font-bold">
                    <Quote className="h-3 w-3 fill-green-600 text-green-600" />
                    <span className="font-semibold">{citationLevel()}</span>{" "}
                  </Badge>
                )}
                {influentialLevel() && (
                  <Badge variant="default" className="h-6 px-2 text-xs font-bold">
                    <Zap className="h-3 w-3 fill-amber-700 text-amber-700" />
                    <span className="font-semibold">{influentialLevel()}</span>{" "}
                  </Badge>
                )}
              </HStack>
            )}

            {/* SJR Journal Metrics */}
            {sjr_data && (
              <div className="mt-2 rounded-md border border-accent/30 bg-accent/20 p-2">
                <HStack className="flex-wrap items-center gap-2">
                  <Badge 
                    variant={
                      sjr_data.quartile === 'Q1' ? 'default' : 
                      sjr_data.quartile === 'Q2' ? 'secondary' : 
                      'outline'
                    }
                    className="h-6 px-2 font-bold"
                  >
                    <Award className="mr-1 h-3 w-3" />
                    {sjr_data.quartile}
                  </Badge>
                  
                  <span className="text-xs">
                    <span className="font-semibold">SJR:</span>{" "}
                    <span className="font-bold text-primary">{sjr_data.sjr_score.toFixed(2)}</span>
                  </span>
                  
                  {sjr_data.percentile && (
                    <Badge variant="outline" className="h-6 px-2">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Top {(100 - sjr_data.percentile).toFixed(1)}%
                    </Badge>
                  )}
                  
                  {sjr_data.impact_factor && (
                    <span className="text-xs text-muted-foreground">
                      IF: <span className="font-semibold">{sjr_data.impact_factor.toFixed(1)}</span>
                    </span>
                  )}
                  
                  {sjr_data.h_index && (
                    <span className="text-xs text-muted-foreground">
                      h-index: <span className="font-semibold">{sjr_data.h_index}</span>
                    </span>
                  )}
                </HStack>
              </div>
            )}
          </VStack>

          {/* Bottom: Venue and Citation Text - Horizontal */}
          {(year || venue || citation_count || influential_citation_count) && (
            <HStack className="mt-2 w-full flex-wrap items-center gap-4 border-t pt-2 text-xs">
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
