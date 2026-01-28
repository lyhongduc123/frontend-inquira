"use client";

import { useEffect, useRef, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ArrowUp, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (msg: string) => void;
  isDisabled?: boolean;
  isAtBottom?: boolean;
}

export function ChatInput({
  onSend,
  isDisabled,
  isAtBottom = false,
}: ChatInputProps) {
  const [msg, setMsg] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    if (!msg.trim() || isDisabled) return;
    onSend(msg);
    setMsg("");
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    const newHeight = Math.min(el.scrollHeight, 200); // Max height of 200px
    el.style.height = `${newHeight}px`;
  }

  useEffect(() => {
    if (textareaRef.current) {
      handleInput();
    }
  }, [msg]);

  return (
    <div
      className={cn(
        "py-4 transition-all duration-500 ease-out w-full"
      )}
    >
      <div
        className={cn(
          "relative transition-all duration-500 ease-out",
          isAtBottom && "mx-auto max-w-3xl"
        )}
      >
        <InputGroup
          className={cn(
            "rounded-2xl border-2 transition-all duration-300 bg-background/95 backdrop-blur-sm",
            isFocused
              ? "border-primary shadow-lg shadow-primary/20"
              : "border-border shadow-sm hover:shadow-md"
          )}
        >
          <InputGroupTextarea
            placeholder="What would you like to know?"
            value={msg}
            ref={textareaRef}
            disabled={isDisabled}
            className="min-h-[44px] max-h-[200px]"
            onChange={(e) => {
              setMsg(e.target.value);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDownCapture={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <InputGroupAddon align="block-end">
            <InputGroupButton
              variant="ghost"
              className="rounded-full transition-colors hover:bg-accent"
              size="icon-xs"
            >
              <Plus className="h-4 w-4" />
            </InputGroupButton>
            <Separator orientation="vertical" className="ml-auto h-4" />
            <InputGroupButton
              variant="default"
              className={cn(
                "rounded-full transition-all duration-300",
                msg.trim() && !isDisabled
                  ? "bg-primary hover:bg-primary/90 scale-100"
                  : "scale-95 opacity-50"
              )}
              size="icon-xs"
              onClick={handleSend}
              disabled={isDisabled || !msg.trim()}
            >
              <ArrowUp className="h-4 w-4" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}
