import { PaperMetadata } from "./paper.type";

/**
 * Conversation Types - Aligned with Backend Schemas
 * Backend: app/conversations/schemas.py
 */

export interface ConversationCreate {
  title?: string | null;
  conversationType?: string;
  primaryPaperId?: string | null;
}

export interface ConversationUpdate {
  title?: string | null;
  isArchived?: boolean | null;
}

export interface Message {
  id: number;
  role: string;
  content: string;
  sources?: PaperMetadata[] | null;
  paperSnapshots?: PaperMetadata[] | null;
  progressEvents?: Array<{
    type: string;
    content: string;
    metadata?: Record<string, unknown>;
    timestamp: number;
  }> | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title?: string | null;
  createdAt?: string;
  updatedAt: string;
  messageCount: number;
  isArchived: boolean;
  conversationType: string;
  primaryPaperId?: string | null;
  messages: Message[];
}

export interface ConversationListResponse {
  items: Conversation[];
  total: number;
  page: number;
  page_size: number;
}

export interface ConversationDelete {
  message: string;
}
