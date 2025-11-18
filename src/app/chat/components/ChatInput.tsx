"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ArrowUp, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function ChatInput({ onSend, isDisabled }: { onSend: (msg: string) => void; isDisabled?: boolean }) {
  const [msg, setMsg] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [originalHeight, setOriginalHeight] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    if (!msg.trim() || isDisabled) return;
    onSend(msg);
    setMsg("");
    setIsExpanded(false);
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;

    setIsExpanded(el.scrollHeight > (originalHeight || 60));
  }

  useEffect(() => {
    const el = textareaRef.current;
    if (el && originalHeight === null) {
      setOriginalHeight(el.offsetHeight);
    }
  }, [originalHeight]);

  return (
    <div className="p-4">
      <InputGroup>
        <InputGroupTextarea
          placeholder="Ask me anything..."
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
