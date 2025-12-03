import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, AuthTokens } from "@/types/auth.type";
import { authApi } from "@/lib/auth-api";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  login: (tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setTokens: (tokens) => set({ tokens }),

      setIsLoading: (isLoading) => set({ isLoading }),

      login: async (tokens: AuthTokens) => {
        try {
          set({ tokens, isLoading: true });
          const user = await authApi.getMe(tokens.access_token);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("Login failed:", error);
          set({ tokens: null, user: null, isAuthenticated: false, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        const { tokens } = get();
        try {
          if (tokens?.refresh_token) {
            await authApi.logout(tokens.refresh_token);
          }
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({ user: null, tokens: null, isAuthenticated: false });
        }
      },

      refreshAuth: async () => {
        const { tokens } = get();
        if (!tokens?.refresh_token) {
          throw new Error("No refresh token available");
        }

        try {
          const newTokens = await authApi.refreshToken(tokens.refresh_token);
          const user = await authApi.getMe(newTokens.access_token);
          set({ tokens: newTokens, user, isAuthenticated: true });
        } catch (error) {
          console.error("Token refresh failed:", error);
          set({ tokens: null, user: null, isAuthenticated: false });
          throw error;
        }
      },

      checkAuth: async () => {
        const { tokens } = get();
        if (!tokens?.access_token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        try {
          const user = await authApi.getMe(tokens.access_token);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("Auth check failed:", error);
          // Try to refresh token
          try {
            await get().refreshAuth();
          } catch {
            set({ tokens: null, user: null, isAuthenticated: false, isLoading: false });
          }
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        tokens: state.tokens,
      }),
    }
  )
);
