import { PaperSource } from "./paper.type";

export interface Message {
  role: "user" | "assistant";
  text: string;
  sources?: PaperSource[];
}