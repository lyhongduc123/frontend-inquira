import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Author } from "@/types/paper.type";
import { ExternalLink, BookOpen, Users, Calendar } from "lucide-react";

interface PaperCardProps {
  title: string;
  url: string;
  snippet?: string;
  authors?: Author[];
  year?: number;
  venue?: string;
  abstract?: string;
  citation_count?: number;
}

export function PaperCard({ 
  title, 
  url, 
  snippet, 
  authors, 
  year, 
  venue, 
  abstract,
  citation_count 
}: PaperCardProps) {
  const displayText = snippet || abstract;

  const formatAuthors = (authorsArr: Author[]) => {
    if (authorsArr.length === 0) return "";
    if (authorsArr.length <= 3) {
      return authorsArr.map(author => author.name).join(", ");
    }

    const authorsArray = authorsArr.slice(0, 3).map(author => author.name);
    const remainingCount = authorsArr.length - 4;
    const lastAuthor = authorsArr[authorsArr.length - 1].name;
    return `${authorsArray.join(", ")}, ... , ${lastAuthor} (+${remainingCount} more)`;
  }
  
  return (
    <Card className="transition hover:bg-accent cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex-1">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1 hover:underline"
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            <span className="flex-1">{title}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Authors and Year */}
        {(authors || year) && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {authors && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{formatAuthors(authors)}</span>
              </div>
            )}
            {year && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{year}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Venue and Citation Count */}
        {(venue || citation_count) && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {venue && <span className="font-medium">{venue}</span>}
            {citation_count !== undefined && (
              <span>• {citation_count} citations</span>
            )}
          </div>
        )}
        
        {/* Abstract/Snippet */}
        {displayText && (
          <p className="text-xs text-muted-foreground line-clamp-3">
            {displayText}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
