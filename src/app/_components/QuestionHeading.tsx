interface QuestionHeadingProps {
  text: string;
}

export function QuestionHeading({ text }: QuestionHeadingProps) {
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        {text}
      </h2>
    </div>
  );
}
