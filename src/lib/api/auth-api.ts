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
   * @param skipRetry - If true, skip automatic token refresh on 401 (useful for initial auth checks)
   */
  async getMe(skipRetry = false): Promise<User> {
    const response = await apiClient.get<User>("/api/auth/me", { skipRetry });
    return response;
  },

  /**
   * Refresh access token using httpOnly cookie (no body needed)
   */
  async refreshToken(): Promise<AuthTokens> {
    return apiClient.post<AuthTokens>(
      "/api/auth/refresh",
      {}, // Empty body, refresh token comes from httpOnly cookie
      { skipAuth: true, skipRetry: true }
    );
  },

  /**
   * Logout and revoke refresh token (from httpOnly cookie)
   */
  async logout(): Promise<void> {
    return await apiClient.post(
      "/api/auth/logout",
      {} // Empty body, refresh token comes from httpOnly cookie
    );
  },
};
