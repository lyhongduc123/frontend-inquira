import { PaperSource } from "./paper.type";

export interface Conversation {
  id: string;
  title: string | null;
  message_count: number;
  is_archived: boolean;
  last_updated: string;
}

export interface ConversationDetail extends Conversation {
  created_at: string;
  updated_at: string;
  messages: Array<{
    id: number;
    role: string;
    content: string;
    sources?: Array<PaperSource>;
    created_at: string;
  }>;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  page_size: number;
}
