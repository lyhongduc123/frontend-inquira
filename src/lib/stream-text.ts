import { streamAnswer } from "./stream";

export async function streamText(
  url: string,
  query: string,
  onToken: (text: string) => void
) {
  return streamAnswer(
    url,
    { query },
    {
      onChunk: onToken,
      onError: (e) => console.error("Stream error:", e),
    }
  );
}
