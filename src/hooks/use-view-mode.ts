import { useState, useRef, useCallback } from "react";
import { ViewMode } from "@/types/chat.type";
import { MessageAreaRef } from "@/app/_components/MessageArea";

export function useViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>("conversation");
  const messageAreaRef = useRef<MessageAreaRef>(null);
  
  const handleQueryClick = useCallback((index: number) => {
    messageAreaRef.current?.scrollToMessage(index);
  }, []);
  
  return { 
    viewMode, 
    setViewMode, 
    messageAreaRef, 
    handleQueryClick 
  };
}
