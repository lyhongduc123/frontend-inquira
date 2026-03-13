import { useDetailSidebarStore } from "@/store/paper-detail-sidebar-store";
import { useSidebarManager } from "@/components/ui/sidebar";
import type { PaperMetadata } from "@/types/paper.type";

/**
 * Hook for managing the detail sidebar
 * Provides convenient methods for opening different content types
 */
export function useDetailSidebar() {
  const manager = useSidebarManager();
  const rightSidebar = manager.use("right");
  const { open, close, isOpen, contentType, content } = useDetailSidebarStore();

  const openPaper = (paper: PaperMetadata) => {
    open("paper", paper);
    rightSidebar?.setOpen(true);
  };

  const openReference = (reference: PaperMetadata) => {
    open("reference", reference);
    rightSidebar?.setOpen(true);
  };

  const closeSidebar = () => {
    close();
    rightSidebar?.setOpen(false);
  }

  return {
    isOpen,
    contentType,
    content,
    open,
    openPaper,
    openReference,
    closeSidebar
  };
}
