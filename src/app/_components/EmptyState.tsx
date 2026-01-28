import { ChatInput } from "./ChatInput";
import { TypographyP } from "@/components/global/typography";
import { VStack } from "@/components/layout/vstack";

interface EmptyStateProps {
  onSend: (query: string) => void;
  isDisabled: boolean;
}

export function EmptyState({ onSend, isDisabled }: EmptyStateProps) {
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
        <ChatInput onSend={onSend} isDisabled={isDisabled} isAtBottom={false} />
      </div>
    </VStack>
  );
}
