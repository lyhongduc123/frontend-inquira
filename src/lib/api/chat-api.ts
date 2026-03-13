/**
 * Chat API - Streaming endpoints for chat interactions
 * Backend: app/chat/router.py
 */

const CHAT_BASE = "/api/v1/chat";

export interface ChatMessageRequest {
  query: string;
  conversation_id?: string | null;
  filter?: Record<string, unknown>;
  model?: string | null;
  stream?: boolean;
  pipeline?: "database" | "hybrid" | "standard";
  use_hybrid_pipeline?: boolean; // Deprecated: use pipeline field
}

export interface PaperDetailChatRequest {
  query: string;
  conversation_id?: string | null;
  model?: string | null;
}

export interface FeedbackRequest {
  message_id: number;
  rating: number; // 1-5
  comment?: string | null;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
}

export const chatApi = {
  /**
   * Stream chat message response with citations (Legacy v1 API)
   * Returns SSE stream with conversation, metadata, tokens, and done events
   */
  getStreamUrl(): string {
    return `${CHAT_BASE}/stream`;
  },

  /**
   * Stream paper detail chat
   * Chat about a specific paper with full-text context
   */
  getStreamPaperUrl(paperId: string): string {
    return `${CHAT_BASE}/stream/paper/${paperId}`;
  },

  /**
   * Submit feedback for a message
   */
  async submitFeedback(
    messageId: number,
    request: FeedbackRequest
  ): Promise<FeedbackResponse> {
    const response = await fetch(`${CHAT_BASE}/feedback/${messageId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit feedback: ${response.statusText}`);
    }

    return response.json();
  },

  // ==================== EVENT-DRIVEN API (v2) ====================

  /**
   * Submit a chat task for background processing (Event-Driven v2)
   * Returns immediately with task_id
   */
  getEventDrivenSubmitUrl(): string {
    return `${CHAT_BASE}/submit`;
  },

  /**
   * Stream events from a task (resumable with from_sequence)
   * Supports reconnection - client can resume from last sequence number
   */
  getEventDrivenStreamUrl(taskId: string, fromSequence: number = 0): string {
    return `${CHAT_BASE}/stream/${taskId}?from_sequence=${fromSequence}`;
  },

  /**
   * Get task status
   */
  getTaskStatusUrl(taskId: string): string {
    return `${CHAT_BASE}/tasks/${taskId}`;
  },
};
