import { ConversationListResponse, ConversationDetail } from "../types/conversation.type";

const API_BASE_URL = '/api';

export const conversationsApi = {
  /**
   * List all conversations for the current user
   */
  async list(page: number = 1, pageSize: number = 20, archived?: boolean): Promise<ConversationListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    
    if (archived !== undefined) {
      params.append('archived', archived.toString());
    }
    
    const response = await fetch(`${API_BASE_URL}/conversations?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Create a new conversation
   */
  async create(title?: string): Promise<ConversationDetail> {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Get a specific conversation by ID
   */
  async get(conversationId: string): Promise<ConversationDetail> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`);
    console.log('Fetch conversation response:', response);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Update a conversation (rename or archive)
   */
  async update(conversationId: string, updates: { title?: string; is_archived?: boolean }): Promise<ConversationDetail> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update conversation: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Delete a conversation
   */
  async delete(conversationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.statusText}`);
    }
  },
};
