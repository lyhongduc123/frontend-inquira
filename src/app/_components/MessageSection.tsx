import { Message } from "@/types/message.type";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";
import { Box } from "@/components/layout/box";

interface MessageSectionProps {
  isUserMessage: boolean;
  showDivider?: boolean;
  message: Message;
  onRetry?: () => void;
}

export function MessageSection({
  isUserMessage,
  showDivider,
  message: m,
  onRetry,
}: MessageSectionProps) {
  const renderUserMessage = () => {
    return <UserMessage text={m.text} />;
  };

  const renderAssistantMessage = () => {
    return (
      <Box>
        <AssistantMessage
          isVisible={false}
          text={m.text}
          sources={Array.isArray(m.paperSnapshots) ? m.paperSnapshots : []}
          isDone={m.done}
          isError={m.isError}
          onRetry={onRetry}
        />
      </Box>
    );
  };

  return (
    <Box className="w-full space-y-4 z-30">
      {isUserMessage ? renderUserMessage() : renderAssistantMessage()}
    </Box>
  );
}
