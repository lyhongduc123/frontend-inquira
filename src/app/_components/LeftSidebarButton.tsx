import { SidebarMenuButton } from "@/components/ui/sidebar";

export function LeftSidebarButton({
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
    <SidebarMenuButton
      onClick={onClick}
      tooltip={!isOpen ? text : undefined}
      className="w-full"
    >
      {children}
      {isOpen && <span>{text}</span>}
    </SidebarMenuButton>
  );
}
