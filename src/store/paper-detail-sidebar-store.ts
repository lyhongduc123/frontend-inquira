import { PaperMetadata } from "@/types/paper.type";
import { create } from "zustand";

export type SidebarContentType = "paper" | "reference" | null;
export type SidebarContent = PaperMetadata | null;

interface DetailSidebarState {
  isOpen: boolean;
  contentType: SidebarContentType;
  content: SidebarContent;
  referencePapers: PaperMetadata[];
  canBackToReferences: boolean;
  open: (contentType: SidebarContentType, content: SidebarContent) => void;
  openReferences: (references: PaperMetadata[]) => void;
  openPaperFromReferences: (paper: PaperMetadata) => void;
  backToReferences: () => void;
  close: () => void;
}

/**
 * Generic store for managing the detail sidebar
 * Can display different types of content (papers, references, etc.)
 */
export const useDetailSidebarStore = create<DetailSidebarState>((set) => ({
  isOpen: false,
  contentType: null,
  content: null,
  referencePapers: [],
  canBackToReferences: false,
  open: (contentType, content) =>
    set({
      isOpen: true,
      contentType,
      content,
      referencePapers: contentType === "reference" && content ? [content] : [],
      canBackToReferences: false,
    }),
  openReferences: (references) =>
    set({
      isOpen: true,
      contentType: "reference",
      content: references[0] ?? null,
      referencePapers: references,
      canBackToReferences: false,
    }),
  openPaperFromReferences: (paper) =>
    set((state) => ({
      isOpen: true,
      contentType: "paper",
      content: paper,
      referencePapers: state.referencePapers,
      canBackToReferences: state.referencePapers.length > 0,
    })),
  backToReferences: () =>
    set((state) => ({
      isOpen: true,
      contentType: "reference",
      content: state.referencePapers[0] ?? null,
      referencePapers: state.referencePapers,
      canBackToReferences: false,
    })),
  close: () =>
    set({
      isOpen: false,
      contentType: null,
      content: null,
      referencePapers: [],
      canBackToReferences: false,
    }),
}));

export const usePaperDetailSidebarStore = useDetailSidebarStore;
