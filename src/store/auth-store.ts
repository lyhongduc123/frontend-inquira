import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, AuthTokens } from "@/types/auth.type";
import { authApi } from "@/lib/api/auth-api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCheckedAuth: boolean; // Track if we've checked auth already

  // Actions
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      hasCheckedAuth: false, // Initialize to false

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setIsLoading: (isLoading) => set({ isLoading }),

      login: async () => {
        try {
          set({ isLoading: true });
          // Tokens are in HTTP-only cookies, just fetch user info
          const user = await authApi.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("Login failed:", error);
          set({ user: null, isAuthenticated: false, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Only call logout endpoint if authenticated
          const { isAuthenticated } = get();
          if (isAuthenticated) {
            await authApi.logout();
          }
        } catch (error) {
          // Silently handle logout errors - we're clearing state anyway
          console.debug("Logout error (ignored):", error);
        } finally {
          set({ user: null, isAuthenticated: false, isLoading: false, hasCheckedAuth: false });
        }
      },

      refreshAuth: async () => {
        try {
          // Refresh token is in httpOnly cookie, just fetch new tokens
          await authApi.refreshToken();
          const user = await authApi.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("Token refresh failed:", error);
          set({ user: null, isAuthenticated: false, isLoading: false });
          throw error;
        }
      },

      checkAuth: async () => {
        // Skip if already checked to prevent duplicate calls
        const { hasCheckedAuth } = get();
        if (hasCheckedAuth) {
          console.log("[checkAuth] Already checked, skipping");
          return;
        }

        console.log("[checkAuth] Starting auth check with HTTP-only cookies");
        
        try {
          set({ isLoading: true });
          const user = await authApi.getMe(false);
          console.log("[checkAuth] User authenticated:", user.email);
          set({ user, isAuthenticated: true, isLoading: false, hasCheckedAuth: true });
        } catch (error) {
          console.log("[checkAuth] Not authenticated, clearing state");
          set({ isLoading: false, isAuthenticated: false, user: null, hasCheckedAuth: true });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: () => ({}),
    }
  )
);
