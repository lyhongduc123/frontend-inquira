import type { PaperSource } from "@/types/paper.type";
import { useAuthStore } from "@/store/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Structured event types from backend
export interface PhaseEvent {
  phase: string;
  message: string;
  progress?: number;
}

export interface ThoughtEvent {
  type: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface AnalysisEvent {
  type: string;
  stats?: Record<string, unknown>;
  message?: string;
}

export interface SourcesEvent {
  sources: PaperSource[];
}

export interface ConversationEvent {
  conversation_id: string;
}

// Unified callback interface
export interface StreamCallbacks {
  // Legacy/generic handlers
  onChunk?: (chunk: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
  
  // Structured event handlers
  onConversation?: (conversationId: string) => void;
  onSources?: (sources: PaperSource[]) => void;
  onPhase?: (event: PhaseEvent) => void;
  onThought?: (event: ThoughtEvent) => void;
  onAnalysis?: (event: AnalysisEvent) => void;
  
  // Catch-all for unknown events
  onUnknownEvent?: (eventType: string, data: unknown) => void;
}

export async function streamEvent(
  url: string,
  payload: Record<string, unknown>,
  callbacks: StreamCallbacks
) {
  const { tokens } = useAuthStore.getState();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (tokens?.access_token) {
    headers.Authorization = `Bearer ${tokens.access_token}`;
  }

  const res = await fetch(`${API_BASE_URL}${url}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    const err = new Error(`HTTP ${res.status}: ${errorText}`);
    callbacks.onError?.(err);
    throw err;
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  const dispatch = (eventType: string, rawData: string) => {
    // Parse JSON data if possible
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(rawData);
    } catch {
      // Keep as raw string for text chunks
      parsedData = rawData;
    }

    // Route to appropriate handler based on event type
    switch (eventType) {
      case "conversation":
        if (typeof parsedData === "object" && parsedData !== null) {
          const event = parsedData as ConversationEvent;
          callbacks.onConversation?.(event.conversation_id);
        }
        break;

      case "sources":
        if (typeof parsedData === "object" && parsedData !== null) {
          // Backend can send sources directly as an array or wrapped in an object
          const sources = Array.isArray(parsedData) 
            ? parsedData 
            : (parsedData as SourcesEvent).sources;
          if (sources) {
            callbacks.onSources?.(sources);
          }
        }
        break;

      case "phase":
        if (typeof parsedData === "object" && parsedData !== null) {
          callbacks.onPhase?.(parsedData as PhaseEvent);
        }
        break;

      case "thought":
        if (typeof parsedData === "object" && parsedData !== null) {
          callbacks.onThought?.(parsedData as ThoughtEvent);
        }
        break;

      case "analysis":
        if (typeof parsedData === "object" && parsedData !== null) {
          callbacks.onAnalysis?.(parsedData as AnalysisEvent);
        }
        break;

      case "chunk":
        // Extract text from chunk data object: {text: string, newlines: number}
        let chunkText = "";
        if (typeof parsedData === "object" && parsedData !== null && "text" in parsedData) {
          chunkText = String(parsedData.text);
        } else if (typeof parsedData === "string") {
          chunkText = parsedData;
        }
        if (chunkText) {
          callbacks.onChunk?.(chunkText);
        }
        break;

      case "done":
        callbacks.onDone?.();
        break;

      default:
        // Unknown event type - use catch-all handler
        callbacks.onUnknownEvent?.(eventType, parsedData);
        break;
    }
  };

  /**
   * Process a single SSE message block
   * NOTE: DO NOT MODIFY THIS FUNCTION
   * @param msg SSE message string
   */
  const processSSEMessage = (msg: string) => {
    console.log('SSE message:', msg);
    const lines = msg.split("\n");
    let eventType = "chunk"; // Default event type
    const dataLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        // SSE spec: one optional space after colon should be stripped
        let content = line.slice(5); // Skip "data:"
        if (content.startsWith(" ")) {
          content = content.slice(1); // Remove the one optional space
        }
        dataLines.push(content);
      }
    }

    const data = dataLines.join("");

    if (data || eventType !== "chunk") {
      dispatch(eventType, data);
    }
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      // Decode chunk properly without losing data
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Process complete SSE messages (delimited by double newline)
      let idx;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const msg = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        
        processSSEMessage(msg);
      }
    }

    if (buffer.trim()) {
      processSSEMessage(buffer);
    }
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    callbacks.onError?.(e);
  } finally {
    reader.releaseLock();
  }
}
