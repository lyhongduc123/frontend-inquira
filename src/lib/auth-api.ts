import { User, AuthTokens } from "@/types/auth.type";
import { apiClient } from "./api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const authApi = {
  /**
   * Get OAuth URL for provider
   */
  getOAuthUrl(provider: "google" | "github"): string {
    return `${API_BASE_URL}/api/v1/auth/${provider}`;
  },

  /**
   * Get current user info
   */
  async getMe(): Promise<User> {
    return apiClient.get<User>("/api/v1/auth/me");
  },

  /**
   * Refresh access token (uses skipRetry to avoid infinite loop)
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return apiClient.post<AuthTokens>(
      "/api/v1/auth/refresh",
      { refresh_token: refreshToken },
      { skipAuth: true, skipRetry: true }
    );
  },

  /**
   * Logout and revoke refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    return apiClient.post(
      "/api/v1/auth/logout",
      { refresh_token: refreshToken }
    );
  },
};
