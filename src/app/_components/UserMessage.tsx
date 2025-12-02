interface UserMessageProps {
  text: string;
}

export function UserMessage({ text }: UserMessageProps) {
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-foreground">
        {text}
      </h2>
    </div>
  );
}
