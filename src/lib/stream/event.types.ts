import { PaperMetadata } from "@/types/paper.type";

export enum StreamEvent {
  Progress = "progress",
  Metadata = "metadata",
  Chunk = "chunk",
  Done = "done",
  Error = "error",
  Heartbeat = "heartbeat",
}

export enum EventType {
  PAPER_METADATA = "papers_metadata",

  REASONING = "reasoning",
  SEARCHING = "searching",
  RANKING = "ranking",

  END_EVENT = "end_event",
}

export interface ErrorEvent {
  type: StreamEvent.Error;
  message: string;
  error_type?: string;
}

export interface ProgressEvent {
  type:
    | EventType.RANKING
    | EventType.SEARCHING
    | EventType.REASONING
    | EventType.END_EVENT;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ReasoningEvent {
  type: EventType.REASONING;
  content: string;
}

export interface MetadataEvent {
  type: EventType.PAPER_METADATA;
  papers: PaperMetadata[];
}

export interface ChunkEvent {
  type: StreamEvent.Chunk;
  content: string;
}
