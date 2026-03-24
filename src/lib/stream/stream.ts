import { StreamEvent, ProgressEvent, MetadataEvent, ChunkEvent } from "./event.types";

export interface StreamCallbacks {
  onChunk?: (chunk: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
  onMetadata?: (event: MetadataEvent) => void;
  onProgress?: (event: ProgressEvent) => void;
  onHeartbeat?: () => void;
  onUnknownEvent?: (eventType: string, data: unknown) => void;
}

export interface StreamOptions {
  heartbeatTimeout?: number;
  signal?: AbortSignal;
}

export interface StreamEventPayload {
  query: string;
  conversationId?: string;
  messageId?: string;
  filters?: Record<string, unknown>;
  model?: string;
  isRetry?: boolean;
  clientMessageId?: string;
  pipeline?: "database" | "hybrid";
  useHybridPipeline?: boolean; // Deprecated: kept for backward compatibility
}

function isAbortError(error: unknown, signal?: AbortSignal): boolean {
  if (signal?.aborted) {
    return true;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  if (error instanceof Error) {
    return error.name === "AbortError";
  }

  return false;
}

export async function streamEvent(
  url: string,
  payload: StreamEventPayload,
  callbacks: StreamCallbacks,
  options: StreamOptions = {},
) {
  const { heartbeatTimeout = 0, signal } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // No need for Authorization header - tokens are in HTTP-only cookies

  // Heartbeat tracking
  let heartbeatTimer: NodeJS.Timeout | null = null;
  let lastActivity = Date.now();

  const resetHeartbeat = () => {
    lastActivity = Date.now();
    if (heartbeatTimer) {
      clearTimeout(heartbeatTimer);
    }

    // Only set timeout if heartbeatTimeout is configured and > 0
    if (heartbeatTimeout > 0) {
      heartbeatTimer = setTimeout(() => {
        const elapsed = Date.now() - lastActivity;
        if (elapsed >= heartbeatTimeout) {
          const err = new Error(
            `Stream heartbeat timeout: No data received for ${heartbeatTimeout / 1000}s`,
          );
          callbacks.onError?.(err);
          reader?.cancel();
        }
      }, heartbeatTimeout);
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    credentials: "include", // Include HTTP-only cookies
    signal, // Support external abort signal
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
    console.log("Dispatching event:", eventType, "with raw data:", rawData);
    resetHeartbeat();

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(rawData);
      console.log("Parsed data:", parsedData);
    } catch {
      parsedData = rawData;
      console.log("Using raw string data:", rawData);
    }

    // Route to appropriate handler based on event type
    switch (eventType as StreamEvent | "token") {
      case StreamEvent.Metadata:
        if (typeof parsedData === "object" && parsedData !== null) {
          const event = parsedData as MetadataEvent;
          callbacks.onMetadata?.(event);
        }
        break;
      case StreamEvent.Progress:
        if (typeof parsedData === "object" && parsedData !== null) {
          const event = parsedData as ProgressEvent;
          callbacks.onProgress?.(event);
        }
        break;
      case StreamEvent.Chunk:
      case "token":
        let chunk = "";
        if (typeof parsedData === "object" && parsedData !== null && "content" in parsedData) {
          const event = parsedData as ChunkEvent;
          chunk = String(event.content);
        } else if (typeof parsedData === "string") {
          chunk = parsedData;
        }
        
        callbacks.onChunk?.(chunk);
        
        break;
      case StreamEvent.Heartbeat:
        callbacks.onHeartbeat?.();
        break;

      case StreamEvent.Done:
        callbacks.onDone?.();
        break;

      case StreamEvent.Error:
        if (typeof parsedData === "object" && parsedData !== null && "message" in parsedData) {
          const errorMsg = String(parsedData.message);
          callbacks.onError?.(new Error(errorMsg));
        } else {
          callbacks.onError?.(new Error("An unknown error occurred"));
        }
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
    console.log("SSE message:", msg);
    const lines = msg.split("\n");
    const dataLines: string[] = [];
    let eventType = "token";

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
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
    resetHeartbeat();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      resetHeartbeat();

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

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
    if (isAbortError(err, signal)) {
      return;
    }

    const e = err instanceof Error ? err : new Error(String(err));
    callbacks.onError?.(e);
  } finally {
    if (heartbeatTimer) {
      clearTimeout(heartbeatTimer);
    }
    reader.releaseLock();
  }
}
