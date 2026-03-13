import { useState, useRef, useCallback, useEffect } from "react";
import { MessageAreaRef } from "@/app/_components/MessageArea";

export function useViewMode() {
  const messageAreaRef = useRef<MessageAreaRef>(null);
  const [activeQueryIndex, setActiveQueryIndex] = useState<number | null>(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const currentActiveIndex = messageAreaRef.current?.activeQueryIndex;
      if (currentActiveIndex !== undefined && currentActiveIndex !== activeQueryIndex) {
        setActiveQueryIndex(currentActiveIndex);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [activeQueryIndex]);
  
  const handleQueryClick = useCallback((index: number) => {
    messageAreaRef.current?.scrollToMessage(index);
    setActiveQueryIndex(index);
  }, []);
  
  const getActiveQueryIndex = useCallback(() => {
    return messageAreaRef.current?.activeQueryIndex ?? null;
  }, []);
  
  return { 
    messageAreaRef, 
    handleQueryClick,
    activeQueryIndex,
    getActiveQueryIndex,
    setActiveQueryIndex
  };
}
