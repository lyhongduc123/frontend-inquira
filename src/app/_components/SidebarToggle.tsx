import { Button } from "@/components/ui/button";
import { Sidebar } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarToggleProps {
  isOpen: boolean;
  onClick: () => void;
}

export function SidebarToggle({ isOpen, onClick }: SidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="absolute left-4 top-4 z-10 min-h-8 min-w-8 h-8 w-8 rounded-full border border-border bg-background shadow-md hover:bg-muted"
    >
      <Sidebar
        className={cn(
          "h-4 w-4 transition-transform duration-300",
          isOpen ? "" : "rotate-180"
        )}
      />
    </Button>
  );
}
