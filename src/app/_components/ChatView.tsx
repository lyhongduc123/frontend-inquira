import { Message } from "@/types/message.type";
import { MessageArea, MessageAreaRef } from "./MessageArea";
import { ChatInputMain } from "./ChatInputMain";
import { VStack } from "@/components/layout/vstack";
import { SearchFilters } from "./FilterPanel";

interface ChatViewProps {
  messages: Message[];
  onSend: (query: string) => void;
  isStreaming: boolean;
  onQueryClick: (index: number) => void;
  messageAreaRef: React.RefObject<MessageAreaRef | null>;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  activeQueryIndex?: number;
  onRetry?: () => void;
  pipeline?: "database" | "hybrid" | "standard";
  onPipelineChange?: (pipeline: "database" | "hybrid" | "standard") => void;
  // Deprecated - kept for backward compatibility
  useHybridPipeline?: boolean;
  setUseHybridPipeline?: (value: boolean) => void;
}

export function ChatView({
  messages,
  onSend,
  isStreaming,
  messageAreaRef,
  filters,
  onFiltersChange,
  onRetry,
  pipeline,
  onPipelineChange,
  useHybridPipeline,
  setUseHybridPipeline,
}: ChatViewProps) {
  return (
      <VStack className="flex-1 gap-0 min-w-0 overflow-y-hidden">
        <VStack className="relative overflow-y-hidden gap-0 min-w-0">
          <MessageArea
            ref={messageAreaRef}
            messages={messages}
            isStreaming={isStreaming}
            onRetry={onRetry}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-background via-background/80 to-transparent" />
        </VStack>
        <div className="absolute bottom-0 left-0 right-0">
          <ChatInputMain
            onSend={onSend}
            isDisabled={isStreaming}
            isAtBottom={true}
            filters={filters}
            onFiltersChange={onFiltersChange}
            pipeline={pipeline}
            onPipelineChange={onPipelineChange}
            useHybridPipeline={useHybridPipeline}
            setUseHybridPipeline={setUseHybridPipeline}
          />
        </div>
      </VStack>

  );
}
