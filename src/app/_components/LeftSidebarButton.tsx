import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SidebarButton({
  isOpen,
  onClick,
  text,
  children,
}: {
  isOpen: boolean;
  onClick: () => void;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        "flex flex-row items-center justify-start gap-2 min-h-8 min-w-8 h-full transition-all duration-300",
        isOpen ? "w-full px-4" : "w-8 px-2"
      )}
    >
      <div className="shrink-0">{children}</div>
      {isOpen && <span className="whitespace-nowrap">{text}</span>}
      
    </Button>
  );
}
