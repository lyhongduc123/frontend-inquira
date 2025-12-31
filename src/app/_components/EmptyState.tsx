import { ChatInput } from "./ChatInput";

interface EmptyStateProps {
  onSend: (query: string) => void;
  isDisabled: boolean;
}

export function EmptyState({ onSend, isDisabled }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to Exegent
          </h1>
          <p className="text-lg text-muted-foreground">
            Your AI-powered research assistant. Ask questions and get
            evidence-based answers with citations.
          </p>
        </div>
        <ChatInput onSend={onSend} isDisabled={isDisabled} isAtBottom={false} />
      </div>
    </div>
  );
}
