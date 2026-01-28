import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyP } from "@/components/global/typography";

interface PaperAbstractSectionProps {
  abstract?: string;
}

export function PaperAbstractSection({ abstract }: PaperAbstractSectionProps) {
  if (!abstract) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Abstract</CardTitle>
      </CardHeader>
      <CardContent>
        <TypographyP size="sm" leading="relaxed">
          {abstract}
        </TypographyP>
      </CardContent>
    </Card>
  );
}
