import { ChatInputMain } from "./ChatInputMain";
import { TypographyP } from "@/components/global/typography";
import { VStack } from "@/components/layout/vstack";
import { SearchFilters } from "./FilterPanel";

interface EmptyStateProps {
  onSend: (query: string) => void;
  isDisabled: boolean;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  pipeline?: "database" | "hybrid" | "standard";
  onPipelineChange?: (pipeline: "database" | "hybrid" | "standard") => void;
  // Deprecated - kept for backward compatibility
  useHybridPipeline?: boolean;
  setUseHybridPipeline?: (value: boolean) => void;
}

export function EmptyState({
  onSend,
  isDisabled,
  filters,
  onFiltersChange,
  pipeline,
  onPipelineChange,
  useHybridPipeline,
  setUseHybridPipeline,
}: EmptyStateProps) {
  return (
    <VStack className="flex-1 items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-3 text-center">
          <h1 className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-4xl font-bold text-transparent">
            Welcome to Exegent
          </h1>
          <TypographyP variant="muted" size="lg">
            Your AI-powered research assistant. Ask questions and get
            evidence-based answers with citations.
          </TypographyP>
        </div>
        <ChatInputMain
          onSend={onSend}
          isDisabled={isDisabled}
          isAtBottom={false}
          filters={filters}
          onFiltersChange={onFiltersChange}
          useHybridPipeline={useHybridPipeline}
          setUseHybridPipeline={setUseHybridPipeline}
        />
      </div>
    </VStack>
  );
}
