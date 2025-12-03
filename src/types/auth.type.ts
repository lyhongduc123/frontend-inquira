export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url: string;
  provider: "google" | "github";
  is_active: boolean;
  created_at: string;
}

export interface OAuthUrlResponse {
  authorization_url: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
