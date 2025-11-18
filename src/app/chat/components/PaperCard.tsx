import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export function PaperCard({ title, url, snippet }: { title: string; url: string; snippet?: string }) {
  return (
    <Card className="transition hover:bg-accent cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 underline">
            {title}
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardTitle>
      </CardHeader>
      {snippet && <CardContent className="text-xs text-muted-foreground">{snippet}</CardContent>}
    </Card>
  );
}
