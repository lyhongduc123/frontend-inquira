import { User, AuthTokens } from "@/types/auth.type";
import { apiClient } from "./api-client";

export const authApi = {
  /**
   * Get OAuth URL for provider
   * This goes directly to backend since it's used for OAuth redirect
   */
  getOAuthUrl(provider: "google" | "github"): string {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${backendUrl}/api/v1/auth/${provider}`;
  },

  /**
   * Get current user info
   */
  async getMe(): Promise<User> {
    return apiClient.get<User>("/api/auth/me");
  },

  /**
   * Refresh access token (uses skipRetry to avoid infinite loop)
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return apiClient.post<AuthTokens>(
      "/api/auth/refresh",
      { refresh_token: refreshToken },
      { skipAuth: true, skipRetry: true }
    );
  },

  /**
   * Logout and revoke refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    return apiClient.post(
      "/api/auth/logout",
      { refresh_token: refreshToken }
    );
  },
};
