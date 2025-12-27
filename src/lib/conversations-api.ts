import { apiClient } from "./api-client";
import {
  ConversationListResponse,
  ConversationDetail,
} from "../types/conversation.type";

export const conversationsApi = {
  /**
   * List all conversations for the current user
   */
  async list(
    page: number = 1,
    pageSize: number = 20,
    archived?: boolean
  ): Promise<ConversationListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (archived !== undefined) {
      params.append("archived", archived.toString());
    }

    return apiClient.get<ConversationListResponse>(
      `/api/v1/conversations?${params}`
    );
  },

  /**
   * Create a new conversation
   */
  async create(title?: string): Promise<ConversationDetail> {
    return apiClient.post<ConversationDetail>("/api/v1/conversations", {
      title,
    });
  },

  /**
   * Get a specific conversation by ID
   */
  async get(conversationId: string): Promise<ConversationDetail> {
    return apiClient.get<ConversationDetail>(
      `/api/v1/conversations/${conversationId}`
    );
  },

  /**
   * Update a conversation (rename or archive)
   */
  async update(
    conversationId: string,
    updates: { title?: string; is_archived?: boolean }
  ): Promise<ConversationDetail> {
    return apiClient.patch<ConversationDetail>(
      `/api/v1/conversations/${conversationId}`,
      updates
    );
  },

  /**
   * Delete a conversation
   */
  async delete(conversationId: string): Promise<void> {
    return apiClient.delete(`/api/v1/conversations/${conversationId}`);
  },
};
