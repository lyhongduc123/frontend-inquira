import { Message } from "@/types/message.type";
import { ProgressState } from "@/hooks/use-progress-tracking";
import { MessageArea, MessageAreaRef } from "./MessageArea";
import { ChatInput } from "./ChatInput";
import { QueryNavigator } from "./QueryNavigator";
import { ViewMode } from "@/types/chat.type";
import { AnimatePresence, motion } from "framer-motion";
import { HStack } from "@/components/layout/hstack";
import { VStack } from "@/components/layout/vstack";
import { Box } from "@/components/layout/box";

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
  messageAreaRef,
}: ChatViewProps) {
  return (
    <HStack className="flex-1 overflow-hidden gap-0 min-w-0">
      {/* Query Navigator - shown in reading mode */}
      <AnimatePresence mode="wait">
        {viewMode === "reading" && messages.length > 0 && (
          <motion.div
            key="query-nav"
            layout="position"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{
              type: "tween",
              duration: 0.25,
              ease: "easeOut",
            }}
            className="shrink-0 overflow-hidden"
          >
            <Box className="w-80 h-full overflow-hidden">
              <QueryNavigator messages={messages} onQueryClick={onQueryClick} />
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <VStack className="flex-1 overflow-hidden gap-0">
        <VStack className="relative flex-1 overflow-y-hidden gap-0">
          <MessageArea
            ref={messageAreaRef}
            messages={messages}
            progress={progress}
            isStreaming={isStreaming}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-background via-background/80 to-transparent" />
        </VStack>
        <div className="relative shrink-0 z-10">
          <ChatInput
            onSend={onSend}
            isDisabled={isStreaming}
            isAtBottom={true}
          />
        </div>
      </VStack>
    </HStack>
  );
}
