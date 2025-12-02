import { Button } from "@/components/ui/button";
import { PaperSource } from "@/types/paper.type";

interface CitationTriggerProps {
  paperDetail: PaperSource;
  number: number;
  isVisible: boolean;
  onClick: () => void;
}

export function CitationTrigger({
  number,
  isVisible,
  onClick,
}: CitationTriggerProps) {
  const handleOnClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };

  return (
    <Button
      variant="default"
      className={`px-1 py-0 mx-0.5 align-baseline text-sm w-fit h-fit ${
        isVisible ? "" : "opacity-50 pointer-events-none"
      }`}
      onClick={handleOnClick}
    >
      {number}
    </Button>
  );
}
