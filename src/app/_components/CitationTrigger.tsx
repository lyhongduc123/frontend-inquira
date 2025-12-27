import { Button } from "@/components/ui/button";
import { PaperSource } from "@/types/paper.type";
import { forwardRef } from "react";

interface CitationTriggerProps {
  paperDetail: PaperSource;
  number: number;
  isVisible: boolean;
  onClick: () => void;
}

export const CitationTrigger = forwardRef<HTMLButtonElement, CitationTriggerProps>(
  function CitationTrigger({ number, isVisible, onClick }, ref) {
  const handleOnClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };

  return (
    <Button
      ref={ref}
      variant="default"
      className={`px-1 py-0 mx-0.5 align-baseline text-sm w-fit min-w-5 h-6 transition-all duration-200 ${
        isVisible 
          ? "focus:shadow-md focus:ring-2 focus:ring-primary focus:ring-offset-1 active:scale-95 focus:bg-secondary focus:text-primary" 
          : "opacity-50 pointer-events-none"
      }`}
      onClick={handleOnClick}
    >
      {number}
    </Button>
  );
  }
);
