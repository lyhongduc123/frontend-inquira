import type { PaperSource } from "@/types/paper.type";

export interface StreamCallbacks {
  onEvent?: (type: string, data: unknown) => void;
  onConversation?: (id: string) => void;
  onSources?: (sources: PaperSource[]) => void;
  onChunk?: (chunk: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export async function streamEvent(
  url: string,
  payload: Record<string, unknown>,
  callbacks: StreamCallbacks
) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

  const dispatch = (event: string, rawData: string) => {
    let data: unknown = rawData;

    try {
      data = JSON.parse(rawData);
    } catch {
      // Keep data as raw string if not JSON
    }

    switch (event) {
      case "conversation":
        callbacks.onConversation?.((data as any)?.conversation_id);
        break;
      case "sources":
        callbacks.onSources?.(data as PaperSource[]);
        break;
      case "chunk":
        callbacks.onChunk?.(typeof data === "string" ? data : rawData);
        break;
      case "event":
        callbacks.onEvent?.(event, data);
        break;
      case "done":
        callbacks.onDone?.();
        break;
    }
  };

  const processSSEMessage = (msg: string) => {
    const lines = msg.split("\n");
    let event = "chunk";
    const dataLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith("event:")) {
        event = line.slice("event:".length).trim();
      } else if (line.startsWith("data:")) {
        const content = line.slice("data:".length + 1);
        dataLines.push(content);
      } else {
        dataLines.push("\n");
        dataLines.push(line);
      }
    }

    const data = dataLines.join("");
    if (data || event !== "chunk") {
      dispatch(event, data);
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
        if (msg.trim()) {
          processSSEMessage(msg);
        }
      }
    }

    // Process any remaining data in buffer
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
