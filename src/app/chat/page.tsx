"use client";

import { useState } from "react";
import { ChatMessages } from "../_components/ChatMessages";
import { ChatInput } from "../_components/ChatInput";
import { LeftSidebar } from "../_components/Sidebar";
import { streamAnswer } from "@/lib/stream";
import { Message } from "@/types/message.type";

export default function ChatPage() {
  const [messages, setMessages] = useState<unknown[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  async function handleSend(query: string) {
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setIsStreaming(true);

    const aiMsg = { role: "assistant", text: "" };
    setMessages((prev) => [...prev, aiMsg]);

    try {
      await streamAnswer("/chat/api", query, ((token: string) => {
        aiMsg.text += token;
        setMessages((prev) => [...prev.slice(0, -1), { ...aiMsg }]);
      }) as never);
    } catch (error) {
      console.error("Streaming error:", error);
      aiMsg.text = "Error: Failed to get response from server.";
      setMessages((prev) => [...prev.slice(0, -1), { ...aiMsg }]);
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-row h-screen">
      <LeftSidebar isOpen={false} />
      <div className="flex flex-col flex-1 h-full">
        <div className="flex-1 overflow-hidden">
          <ChatMessages messages={messages as Message[]} />
        </div>
        <div className="border-t bg-background">
          <div className="max-w-3xl mx-auto px-4">
            <ChatInput onSend={handleSend} isDisabled={isStreaming} />
          </div>
        </div>
      </div>
    </div>
  );
}
