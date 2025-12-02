import { PaperSource } from "./paper.type";

export interface Message {
  id?: number;
  role: "user" | "assistant";
  text: string;
  sources?: PaperSource[];
  done?: boolean;
  streamBuffer?: string;
}