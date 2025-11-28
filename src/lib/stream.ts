import type { PaperSource } from "@/types/paper.type";

export interface StreamCallbacks {
  onEvent?: (type: string, data: unknown) => void;
  onConversation?: (id: string) => void;
  onSources?: (sources: PaperSource[]) => void;
  onChunk?: (chunk: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export async function streamAnswer(
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

  let buffer = "";
  const decoder = new TextDecoder();

  const dispatch = (event: string, rawData: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = rawData;

    // JSON? parse safely
    try {
      data = JSON.parse(rawData);
    } catch {}

    callbacks.onEvent?.(event, data);

    switch (event) {
      case "conversation":
        callbacks.onConversation?.(data.conversation_id);
        break;
      case "sources":
        callbacks.onSources?.(data);
        break;
      case "chunk":
        callbacks.onChunk?.(typeof data === "string" ? data : rawData);
        break;
      case "done":
        callbacks.onDone?.();
        break;
      default:
        console.warn("Unknown event type:", event);
        break;
    }
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE messages split by blank lines
      const messages = buffer.split("\n\n");
      buffer = messages.pop() || "";

      for (const msg of messages) {
        if (!msg.trim()) continue;

        const lines = msg.split("\n");
        let event = "message";
        // eslint-disable-next-line prefer-const
        let dataLines: string[] = [];

        for (const line of lines) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          if (line.startsWith("data:"))
            dataLines.push(line.slice(5).trimStart());
        }

        dispatch(event, dataLines.join("\n"));
      }
    }
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    callbacks.onError?.(e);
    throw e;
  } finally {
    reader.releaseLock();
  }
}
