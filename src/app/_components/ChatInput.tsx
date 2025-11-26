"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ArrowUp, Plus, RotateCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ChatInputProps {
  onSend: (msg: string) => void;
  isDisabled?: boolean;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function ChatInput({
  onSend,
  isDisabled,
  showRetry = false,
  onRetry,
}: ChatInputProps) {
  const [msg, setMsg] = useState("");
  const [originalHeight, setOriginalHeight] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    if (!msg.trim() || isDisabled) return;
    onSend(msg);
    setMsg("");
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  useEffect(() => {
    const el = textareaRef.current;
    if (el && originalHeight === null) {
      setOriginalHeight(el.offsetHeight);
    }
  }, [originalHeight]);

  return (
    <div className="p-4">
      {showRetry && (
        <div className="mb-3 flex items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isDisabled}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      )}
      <InputGroup>
        <InputGroupTextarea
          placeholder="What would you like to know?"
          value={msg}
          ref={textareaRef}
          disabled={isDisabled}
          onChange={(e) => {
            setMsg(e.target.value);
            handleInput();
          }}
          onKeyDownCapture={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton
            variant="outline"
            className="rounded-full"
            size="icon-xs"
          >
            <Plus />
          </InputGroupButton>
          <Separator orientation="vertical" className="h-4 ml-auto" />
          <InputGroupButton
            variant="default"
            className="rounded-full"
            size="icon-xs"
            onClick={handleSend}
            disabled={isDisabled || !msg.trim()}
          >
            <ArrowUp />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
