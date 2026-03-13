import { Button } from "@/components/ui/button";
import type { PaperMetadata } from "@/types/paper.type";
import { forwardRef } from "react";

interface CitationTriggerProps {
  paperDetail: PaperMetadata;
  number: number;
  onClick?: () => void;
}

export const CitationTrigger = forwardRef<HTMLButtonElement, CitationTriggerProps>(
  function CitationTrigger({ number, onClick }, ref) {
  const handleOnClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
  };

  return (
    <Button
      ref={ref}
      variant="secondary"
      className={`px-1 py-0 mx-0.5 align-baseline text-sm w-fit min-w-5 h-6 transition-all duration-200 focus:shadow-md focus:ring-2 focus:ring-primary focus:ring-offset-1 active:scale-95 focus:bg-primary focus:text-primary-foreground`}
      onClick={handleOnClick}
    >
      {number}
    </Button>
  );
  }
);
