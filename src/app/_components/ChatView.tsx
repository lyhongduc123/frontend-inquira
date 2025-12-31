import { Message } from "@/types/message.type";
import { ProgressState } from "@/hooks/use-progress-tracking";
import { MessageArea, MessageAreaRef } from "./MessageArea";
import { ChatInput } from "./ChatInput";
import { QueryNavigator } from "./QueryNavigator";
import { ViewMode } from "@/types/chat.type";

interface ChatViewProps {
  messages: Message[];
  progress: ProgressState;
  onSend: (query: string) => void;
  isStreaming: boolean;
  viewMode: ViewMode;
  onQueryClick: (index: number) => void;
  messageAreaRef: React.RefObject<MessageAreaRef | null>;
}

export function ChatView({ 
  messages, 
  progress, 
  onSend, 
  isStreaming, 
  viewMode, 
  onQueryClick, 
  messageAreaRef 
}: ChatViewProps) {
  return (
    <div className="flex flex-row flex-1 overflow-hidden">
      {/* Query Navigator - shown in reading mode */}
      {viewMode === "reading" && messages.length > 0 && (
        <div className="w-80 shrink-0">
          <QueryNavigator
            messages={messages}
            onQueryClick={onQueryClick}
          />
        </div>
      )}
      
      {/* Main chat area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-hidden relative">
          <MessageArea
            ref={messageAreaRef}
            messages={messages}
            progress={progress}
            isStreaming={isStreaming}
          />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-background via-background/80 to-transparent" />
        </div>
        <div className="relative bg-transparent shrink-0 z-10">
          <ChatInput onSend={onSend} isDisabled={isStreaming} isAtBottom={true} />
        </div>
      </div>
    </div>
  );
}
