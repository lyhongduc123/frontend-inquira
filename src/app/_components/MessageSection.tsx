import { Message } from "@/types/message.type";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";
import { QueryProgress } from "./QueryProgress";
import { ThoughtEvent } from "@/lib/stream";

interface MessageSectionProps {
  isUserMessage: boolean;
  showDivider: boolean;
  progressSteps?: string[];
  progressSubtopics?: [string, string][];
  progressThoughts?: ThoughtEvent[];
  message: Message;
}

export function MessageSection({
  isUserMessage,
  showDivider,
  progressSteps = [],
  progressSubtopics = [],
  progressThoughts = [],
  message: m,
}: MessageSectionProps) {
  const renderUserMessage = () => {
    return <UserMessage text={m.text} />;
  };

  const renderAssistantMessage = () => {
    return (
      <div>
        <AssistantMessage
          isVisible={false}
          text={m.text}
          sources={Array.isArray(m.sources) ? m.sources : []}
          showDivider={showDivider}
          isDone={m.done}
        />
      </div>
    );
  };

  return (
    <div className="w-full space-y-4">
      {isUserMessage ? renderUserMessage() : renderAssistantMessage()}
    </div>
  );
}
