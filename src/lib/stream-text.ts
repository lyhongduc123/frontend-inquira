import { streamEvent } from "./stream";

export async function streamText(
  url: string,
  query: string,
  onToken: (text: string) => void
) {
  return streamEvent(
    url,
    { query },
    {
      onChunk: onToken,
      onError: (e) => console.error("Stream error:", e),
    }
  );
}
