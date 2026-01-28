/**
 * API Client with automatic token refresh
 * 
 * This client automatically:
 * - Adds Authorization headers to requests
 * - Detects 401 errors (expired tokens)
 * - Refreshes the access token
 * - Retries the original request with the new token
 * - Unwraps ApiResponse wrapper from backend
 */

import { useAuthStore } from "@/store/auth-store";
import type { ApiResponse } from "@/types/api.type";
import { unwrapApiResponse } from "@/types/api.type";

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  skipRetry?: boolean;
}

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  /**
   * Subscribe to token refresh completion
   */
  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Notify all subscribers when token is refreshed
   */
  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * Refresh the access token
   */
  private async refreshAccessToken(): Promise<string> {
    const { tokens, setTokens, logout } = useAuthStore.getState();

    if (!tokens?.refresh_token) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: tokens.refresh_token }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const apiResponse = await response.json() as ApiResponse<{
        access_token: string;
        refresh_token: string;
        token_type: string;
        expires_in: number;
      }>;
      
      const newTokens = unwrapApiResponse(apiResponse);
      setTokens(newTokens);
      return newTokens.access_token;
    } catch (error) {
      // If refresh fails, logout the user
      await logout();
      throw error;
    }
  }

  /**
   * Make an authenticated request with automatic token refresh
   */
  async request<T = unknown>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { skipAuth = false, skipRetry = false, ...fetchConfig } = config;
    const { tokens } = useAuthStore.getState();

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(fetchConfig.headers as Record<string, string>),
    };

    // Add Authorization header if not skipped
    if (!skipAuth && tokens?.access_token) {
      headers.Authorization = `Bearer ${tokens.access_token}`;
    }

    // Make the request - endpoint should be Next.js API route
    let response = await fetch(endpoint, {
      ...fetchConfig,
      headers,
    });

    // Handle 401 errors (expired token)
    if (response.status === 401 && !skipRetry && !skipAuth) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;

        try {
          const newToken = await this.refreshAccessToken();
          this.isRefreshing = false;
          this.onRefreshed(newToken);

          // Retry the original request with the new token
          headers.Authorization = `Bearer ${newToken}`;
          response = await fetch(endpoint, {
            ...fetchConfig,
            headers,
          });
        } catch (error) {
          this.isRefreshing = false;
          throw error;
        }
      } else {
        // Wait for the ongoing refresh to complete
        const newToken = await new Promise<string>((resolve) => {
          this.subscribeTokenRefresh(resolve);
        });

        // Retry the original request with the new token
        headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(endpoint, {
          ...fetchConfig,
          headers,
        });
      }
    }

    if (!response.ok) {
      // Read response body once as text, then try to parse as JSON
      const errorText = await response.text();
      try {
        const errorResponse = JSON.parse(errorText) as ApiResponse<unknown>;
        if (errorResponse.error) {
          throw new Error(errorResponse.error.message || `Request failed with status ${response.status}`);
        }
      } catch {
        // If parsing fails, use the text error
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }
    }

    // Return empty object for 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    // Parse and unwrap ApiResponse
    const apiResponse = await response.json() as ApiResponse<T>;
    return unwrapApiResponse(apiResponse);
  }

  /**
   * Convenience methods
   */
  async get<T = unknown>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = unknown>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
