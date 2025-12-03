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
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const error = searchParams.get("error");

      if (error) {
        console.error("Auth error:", error);
        router.push("/?error=" + error);
        return;
      }

      if (accessToken && refreshToken) {
        try {
          await login({ access_token: accessToken, refresh_token: refreshToken });
          router.push("/");
        } catch (error) {
          console.error("Login failed:", error);
          router.push("/?error=login_failed");
        }
      } else {
        router.push("/?error=missing_tokens");
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
