import React from "react";

interface QuestionProgressProps {
  steps: string[];
  subtopics?: [string, string][];
  thoughts?: string[];
}

export const QuestionProgress: React.FC<QuestionProgressProps> = ({ steps, subtopics, thoughts }) => {
  return (
    <div className="w-full p-2 bg-muted rounded mb-2">
      <div className="mb-1 text-xs font-bold text-muted-foreground">Query</div>
      <ol className="list-decimal pl-4 space-y-1">
        {steps.map((step, idx) => (
          <li key={idx} className="text-xs font-normal text-primary">
            <span className="font-bold">Query:</span> {step}
          </li>
        ))}
      </ol>
      {/* Thoughts section */}
      {typeof thoughts !== 'undefined' && thoughts.length > 0 && (
        <div className="mt-2">
          <div className="text-xs font-bold text-muted-foreground mb-1">Thoughts</div>
          <ul className="list-disc pl-4 space-y-1">
            {thoughts.map((thought: string, idx: number) => (
              <li key={idx} className="text-xs font-normal">
                {thought}
              </li>
            ))}
          </ul>
        </div>
      )}
      {subtopics && subtopics.length > 0 && (
        <div className="mt-2">
          <div className="text-xs font-bold text-muted-foreground mb-1">Subtopics</div>
          <ul className="list-disc pl-4 space-y-1">
            {subtopics.map(([topic, desc], idx) => (
              <li key={idx} className="text-xs font-normal">
                <span className="font-bold">{topic}:</span> {desc}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
