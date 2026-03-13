import { SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function LeftSidebarMenuButton({
  isOpen,
  onClick,
  text,
  children,
  variant,
  className,
}: {
  isOpen: boolean;
  onClick: () => void;
  text?: string;
  variant?: "outline" | "default";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <SidebarMenuButton
      onClick={onClick}
      tooltip={!isOpen ? text : undefined}
      variant={variant}
      className={cn("w-full", className)}
    >
      {children}
      {isOpen && <span>{text}</span>}
    </SidebarMenuButton>
  );
}
