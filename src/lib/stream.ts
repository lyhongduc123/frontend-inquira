import type { PaperSource } from "@/types/paper.type";

export interface StreamCallbacks {
  onConversation?: (conversationId: string) => void;
  onSources?: (sources: PaperSource[]) => void;
  onChunk?: (chunk: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export async function streamAnswer(
  url: string,
  query: string,
  callbacks: StreamCallbacks,
  conversationId?: string
) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      query,
      conversation_id: conversationId 
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    const error = new Error(errorData.error || `HTTP error! status: ${res.status}`);
    callbacks.onError?.(error);
    throw error;
  }

  if (!res.body) {
    const error = new Error("No response body");
    callbacks.onError?.(error);
    throw error;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        
        // Split by double newline to get complete SSE messages
        const messages = buffer.split("\n\n");
        buffer = messages.pop() || ""; // Keep incomplete message in buffer
        
        for (const message of messages) {
          if (!message.trim()) continue;
          
          // Parse SSE message (can have multiple lines)
          const lines = message.split("\n");
          let eventType = "";
          let data = "";
          
          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.substring(6).trim();
            } else if (line.startsWith("data:")) {
              // SSE spec: "data:" followed by optional space, then content
              // Preserve content exactly as sent (don't trim)
              const afterColon = line.substring(5);
              // Only remove the single space after colon if present
              data = afterColon.startsWith(" ") ? afterColon.substring(1) : afterColon;
            }
          }
          
          if (eventType && data !== "") {
            switch (eventType) {
              case "conversation":
                try {
                  const convData = JSON.parse(data) as { conversation_id: string };
                  callbacks.onConversation?.(convData.conversation_id);
                } catch (e) {
                  console.error("Failed to parse conversation:", e);
                }
                break;
                
              case "sources":
                try {
                  const sources = JSON.parse(data) as PaperSource[];
                  callbacks.onSources?.(sources);
                } catch (e) {
                  console.error("Failed to parse sources:", e);
                }
                break;
                
              case "chunk":
                // Chunk data is JSON-encoded to preserve newlines
                if (callbacks.onChunk) {
                  try {
                    const decodedChunk = JSON.parse(data) as string;
                    // Debug: log chunks to see newlines
                    console.log("Chunk:", JSON.stringify(decodedChunk));
                    callbacks.onChunk(decodedChunk);
                  } catch (e) {
                    console.error("Failed to parse chunk:", e);
                    // Fallback: use data as-is if not valid JSON
                    callbacks.onChunk(data);
                  }
                }
                break;
                
              case "done":
                callbacks.onDone?.();
                break;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Stream reading error:", error);
    const err = error instanceof Error ? error : new Error(String(error));
    callbacks.onError?.(err);
    throw err;
  } finally {
    reader.releaseLock();
  }
}
