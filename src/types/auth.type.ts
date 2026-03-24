export interface User {
  id: number;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  provider: "google" | "github" | "email";
  isActive: boolean;
  createdAt: string;
}

export interface OAuthUrlResponse {
  authorizationUrl: string;
}

export interface AuthTokens {
  // Both access and refresh tokens are now stored in secure httpOnly cookies
  // This interface kept for backward compatibility but tokens should not be accessed from JS
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
