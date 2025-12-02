import React from "react";

interface QueryProgressProps {
  isVisible: boolean;
  steps: string[];
  subtopics?: [string, string][];
  thoughts?: string[];
}

export const QueryProgress: React.FC<QueryProgressProps> = ({ isVisible, steps, subtopics, thoughts }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="w-full p-2 bg-muted rounded mb-2">
      
    </div>
  );
};
