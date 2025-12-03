import { User, AuthTokens } from "@/types/auth.type";

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
  async getMe(accessToken: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Logout and revoke refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Failed to logout: ${response.statusText}`);
    }
  },
};
