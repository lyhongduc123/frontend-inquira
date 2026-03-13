"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { authApi } from "@/lib/api/auth-api";
import { useAuth } from "@/hooks/use-auth";
import { TypographyP } from "@/components/global/typography";
import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { Box } from "@/components/layout/box";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { LeftSidebar } from "@/app/_components/LeftSidebar";
import { Header } from "@/components/global/header";
import { Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  const handleOAuthLogin = (provider: "google" | "github") => {
    sessionStorage.setItem("auth_redirect", redirectTo);

    const url = authApi.getOAuthUrl(provider);
    window.location.href = url;
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    sessionStorage.setItem("auth_redirect", redirectTo);
    const googleUrl = authApi.getOAuthUrl("google");
    const urlWithEmail = `${googleUrl}?login_hint=${encodeURIComponent(email)}`;
    window.location.href = urlWithEmail;
  };

  if (isLoading || isAuthenticated) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Box>
    );
  }

  return (
    <VStack className="h-screen overflow-hidden gap-0">
      <Header />

      <VStack className="flex-1 items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">
              Welcome to Exegent
            </CardTitle>
            <CardDescription className="text-base">
              Sign in to access your conversations and explore academic papers
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Email Input */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <VStack className="gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full"
                />
              </VStack>
              <Button
                type="submit"
                variant="outline"
                className="w-full h-11"
                disabled={!email || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Icon icon="mdi:email-outline" className="h-5 w-5 mr-2" />
                )}
                Continue with Email
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <HStack className="absolute inset-0 items-center">
                <span className="w-full border-t" />
              </HStack>
              <HStack className="relative justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </HStack>
            </div>

            {/* OAuth Providers */}
            <VStack className="gap-2">
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => handleOAuthLogin("google")}
              >
                <Icon icon="logos:google-icon" className="h-5 w-5 mr-2" />
                Continue with Google
              </Button>

              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => handleOAuthLogin("github")}
              >
                <Icon icon="octicon:mark-github-16" className="h-5 w-5 mr-2" />
                Continue with GitHub
              </Button>
            </VStack>

            <TypographyP
              variant="muted"
              size="xs"
              align="center"
              className="pt-2"
            >
              By continuing, you agree to our{" "}
              <span className="underline cursor-pointer">Terms of Service</span>{" "}
              and{" "}
              <span className="underline cursor-pointer">Privacy Policy</span>
            </TypographyP>
          </CardContent>
        </Card>
      </VStack>
    </VStack>
  );
}
