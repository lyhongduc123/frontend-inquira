"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TypographyH3, TypographyH4, TypographyP } from "@/components/global/typography";
import { PaperSource } from "@/types/paper.type";

interface PaperCitationsViewProps {
  paper: PaperSource;
  citations: PaperSource[];
}

export function PaperCitationsView({ paper, citations }: PaperCitationsViewProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const generateBibtex = () => {
    const firstAuthorLastName = paper.authors?.[0]?.name.split(" ").pop() || "unknown";
    const key = `${firstAuthorLastName.toLowerCase()}${paper.year}`;
    
    return `@article{${key},
  title={${paper.title}},
  author={${paper.authors?.map((a) => a.name).join(" and ") || ""}},
  year={${paper.year || ""}},
  journal={${paper.venue || ""}},
  url={${paper.url || ""}}
}`;
  };

  const generateAPA = () => {
    const authorsText = paper.authors
      ? paper.authors.map((a, i) => {
          const nameParts = a.name.split(" ");
          const lastName = nameParts.pop();
          const initials = nameParts.map((n) => n[0]).join(". ");
          return i === paper.authors!.length - 1 && paper.authors!.length > 1
            ? `& ${lastName}, ${initials}.`
            : `${lastName}, ${initials}.`;
        }).join(", ")
      : "";

    return `${authorsText} (${paper.year}). ${paper.title}. ${paper.venue || ""}. ${paper.url || ""}`;
  };

  const generateMLA = () => {
    const authorsText = paper.authors
      ? paper.authors.map((a, i) => {
          if (i === 0) {
            const nameParts = a.name.split(" ");
            const lastName = nameParts.pop();
            const firstName = nameParts.join(" ");
            return `${lastName}, ${firstName}`;
          }
          return a.name;
        }).join(", ")
      : "";

    return `${authorsText}. "${paper.title}." ${paper.venue || ""} (${paper.year}). ${paper.url || ""}`;
  };

  const handleCopy = (format: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <VStack className="gap-6">
      {/* Citation Formats */}
      <Card>
        <CardContent className="pt-6">
          <VStack className="gap-4">
            <TypographyH3 size="sm" weight="semibold">Cite This Paper</TypographyH3>

            {/* BibTeX */}
            <VStack className="gap-2">
              <HStack className="justify-between items-center">
                <TypographyP size="xs" weight="medium" variant="muted">BibTeX</TypographyP>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleCopy("bibtex", generateBibtex())}
                >
                  {copiedFormat === "bibtex" ? (
                    <CheckIcon className="text-green-500" />
                  ) : (
                    <CopyIcon />
                  )}
                </Button>
              </HStack>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                {generateBibtex()}
              </pre>
            </VStack>

            {/* APA */}
            <VStack className="gap-2">
              <HStack className="justify-between items-center">
                <TypographyP size="xs" weight="medium" variant="muted">APA</TypographyP>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleCopy("apa", generateAPA())}
                >
                  {copiedFormat === "apa" ? (
                    <CheckIcon className="text-green-500" />
                  ) : (
                    <CopyIcon />
                  )}
                </Button>
              </HStack>
              <TypographyP size="xs" className="bg-muted p-3 rounded-md">
                {generateAPA()}
              </TypographyP>
            </VStack>

            {/* MLA */}
            <VStack className="gap-2">
              <HStack className="justify-between items-center">
                <TypographyP size="xs" weight="medium" variant="muted">MLA</TypographyP>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleCopy("mla", generateMLA())}
                >
                  {copiedFormat === "mla" ? (
                    <CheckIcon className="text-green-500" />
                  ) : (
                    <CopyIcon />
                  )}
                </Button>
              </HStack>
              <TypographyP size="xs" className="bg-muted p-3 rounded-md">
                {generateMLA()}
              </TypographyP>
            </VStack>
          </VStack>
        </CardContent>
      </Card>

      <Separator />

      {/* Citations List */}
      <VStack className="gap-4">
        <HStack className="justify-between items-center">
          <TypographyH3 size="sm" weight="semibold">
            Papers Citing This Work
          </TypographyH3>
          <Badge variant="secondary">
            {citations.length} citations
          </Badge>
        </HStack>

        <VStack className="gap-3">
          {citations.length === 0 ? (
            <TypographyP size="sm" variant="muted" align="center" className="py-4">
              No citations found
            </TypographyP>
          ) : (
            citations.map((citation) => (
              <Link
                key={citation.paper_id}
                href={`/works/details/${citation.paper_id}`}
                className="block group"
              >
                <VStack className="gap-2 p-3 rounded-lg border hover:bg-accent transition-colors">
                  <HStack className="justify-between items-start gap-2">
                    <TypographyH4 size="sm" weight="medium" className="group-hover:text-primary flex-1 line-clamp-2">
                      {citation.title}
                    </TypographyH4>
                    <ExternalLinkIcon className="size-4 text-muted-foreground shrink-0" />
                  </HStack>

                  <TypographyP size="xs" variant="muted">
                    {citation.authors?.map((a) => a.name).join(", ")}
                  </TypographyP>

                  <HStack className="gap-2">
                    {citation.year && <TypographyP size="xs" variant="muted">{citation.year}</TypographyP>}
                    {citation.citation_count !== undefined && (
                      <>
                        <TypographyP size="xs" variant="muted">•</TypographyP>
                        <TypographyP size="xs" variant="muted">{citation.citation_count.toLocaleString()} citations</TypographyP>
                      </>
                    )}
                  </HStack>
                </VStack>
              </Link>
            ))
          )}
        </VStack>
      </VStack>
    </VStack>
  );
}
