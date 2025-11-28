import { PaperSource } from "./paper.type";

export interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  streamBuffer?: string; 
  done?: boolean;
  sources?: PaperSource[];
}