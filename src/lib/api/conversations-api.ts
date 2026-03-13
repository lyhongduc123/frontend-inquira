import { apiClient } from "./api-client";
import type {
  ConversationCreate,
  ConversationUpdate,
  Conversation,
  ConversationDelete
} from "@/types/conversation.type";
import type { PaginatedData } from "@/types/api.type";

const CONVERSATIONS_BASE = "/api/v1/conversations";

export const conversationsApi = {
  /**
   * List all conversations for the current user
   */
  async list(params: {
    page?: number;
    page_size?: number;
    archived?: boolean;
  } = {}): Promise<PaginatedData<Conversation>> {
    const { page = 1, page_size = 20, archived } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
    });

    if (archived !== undefined) {
      queryParams.append("archived", archived.toString());
    }

    return apiClient.get<PaginatedData<Conversation>>(
      `${CONVERSATIONS_BASE}?${queryParams}`
    );
  },

  /**
   * Create a new conversation
   */
  async create(data: ConversationCreate = {}): Promise<Conversation> {
    return apiClient.post<Conversation>(CONVERSATIONS_BASE, data);
  },

  /**
   * Get a specific conversation by ID with all messages
   */
  async get(conversationId: string): Promise<Conversation> {
    return apiClient.get<Conversation>(
      `${CONVERSATIONS_BASE}/${conversationId}`
    );
  },

  /**
   * Update a conversation (rename or archive)
   */
  async update(
    conversationId: string,
    updates: ConversationUpdate
  ): Promise<Conversation> {
    return apiClient.put<Conversation>(
      `${CONVERSATIONS_BASE}/${conversationId}`,
      updates
    );
  },

  /**
   * Delete a conversation and all its messages
   */
  async delete(conversationId: string): Promise<ConversationDelete> {
    return apiClient.delete<ConversationDelete>(
      `${CONVERSATIONS_BASE}/${conversationId}`
    );
  },
};
