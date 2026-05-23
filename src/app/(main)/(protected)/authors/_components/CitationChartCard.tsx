import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AuthorMetricCard,
  AuthorMetricCardContent,
  AuthorMetricCardFooter,
} from "./AuthorMetricCard";
import {
  Bar,
  XAxis,
  BarChart,
  CartesianGrid,
  LabelList,
} from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VStack } from "@/components/layout/vstack";
import { InfoIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HStack } from "@/components/layout/hstack";
import { Skeleton } from "@/components/ui/skeleton";

interface CitationChartCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countsByYear?: Record<string, Record<string, any>> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openalexCountsByYear?: Record<string, Record<string, any>> | null;
  isLoading?: boolean;
}

export function CitationChartCard({
  countsByYear,
  openalexCountsByYear,
  isLoading,
}: CitationChartCardProps) {
  const [source, setSource] = useState<"internal" | "openalex">("internal");

  if (isLoading) {
    return <ChartCardSkeleton title="YEARLY CITATIONS" />;
  }

  const citationMetrics = Object.entries(countsByYear || {})
    .map(([year, data]) => ({
      year,
      cited_by_count: data.citations || 0,
    }))
    .sort((a, b) => Number(a.year) - Number(b.year));

  const openAlexCitationMetrics = openalexCountsByYear
    ? Object.entries(openalexCountsByYear)
        .map(([year, data]) => ({
          year,
          cited_by_count: data.citations || 0,
        }))
        .sort((a, b) => Number(a.year) - Number(b.year))
    : [];
  const chartConfig = {
    year: {
      label: "Year",
    },
    cited_by_count: {
      label: "Citations",
    },
  } satisfies ChartConfig;

  const chartData =
    source === "internal" ? citationMetrics : openAlexCitationMetrics;

  const shouldShowLabels = chartData.length <= 8;

  const formatCitationCount = (value: number) =>
    Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  return (
    <AuthorMetricCard title="YEARLY CITATIONS">
      <AuthorMetricCardContent>
        <ChartContainer
          config={chartConfig}
          className="w-full h-full min-h-[250px]"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: shouldShowLabels ? 28 : 12,
              right: 12,
              left: 12,
              bottom: 8,
            }}
          >
            <CartesianGrid vertical={false} />

            <XAxis dataKey="year" tickLine={false} axisLine={false} />

            <Bar
              dataKey="cited_by_count"
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
              barSize={28}
            >
              {shouldShowLabels && (
                <LabelList
                  dataKey="cited_by_count"
                  position="top"
                  offset={8}
                  className="fill-foreground"
                  fontSize={11}
                  fontWeight={600}
                  formatter={(value) => formatCitationCount(Number(value) || 0)}
                />
              )}
            </Bar>

            <ChartTooltip
              content={<ChartTooltipContent hideIndicator hideLabel />}
            />
          </BarChart>
        </ChartContainer>
      </AuthorMetricCardContent>
      <AuthorMetricCardFooter>
        <HStack className="flex gap-2 mb-4">
          <Button
            variant={source === "internal" ? "default" : "outline"}
            onClick={() => setSource("internal")}
          >
            Indexed
          </Button>
          <Button
            variant={source === "openalex" ? "default" : "outline"}
            onClick={() => setSource("openalex")}
          >
            OpenAlex
          </Button>
        </HStack>
        {source === "openalex" && (
          <Alert variant="info" className="w-full">
            <InfoIcon className="size-4" />
            <AlertTitle>Data by OpenAlex</AlertTitle>
            <AlertDescription>
              Note that OpenAlex also count datasets citations
            </AlertDescription>
          </Alert>
        )}
      </AuthorMetricCardFooter>
    </AuthorMetricCard>
  );
}

function ChartCardSkeleton({ title }: { title: string }) {
  return (
    <AuthorMetricCard title={title}>
      <AuthorMetricCardContent>
        <VStack className="gap-4">
          <Skeleton className="h-[250px] w-full rounded-md" />
          <HStack className="gap-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </HStack>
        </VStack>
      </AuthorMetricCardContent>
    </AuthorMetricCard>
  );
}
