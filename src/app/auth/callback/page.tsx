"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const handleCallback = async () => {
      const success = searchParams.get("success");
      const error = searchParams.get("error");

      if (error) {
        console.error("Auth error:", error);
        router.push("/login?error=" + error);
        return;
      }

      if (success === "true") {
        try {
          // Both access and refresh tokens are now in HTTP-only cookies
          // Just need to fetch user info to complete login
          await login();
          
          // Get redirect URL from sessionStorage or default to home
          const redirectTo = sessionStorage.getItem("auth_redirect") || "/";
          sessionStorage.removeItem("auth_redirect");
          
          router.push(redirectTo);
        } catch (error) {
          console.error("Login failed:", error);
          router.push("/login?error=login_failed");
        }
      } else {
        router.push("/login?error=missing_tokens");
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
