"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { authApi } from "@/lib/auth-api";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOAuthLogin = (provider: "google" | "github") => {
    const url = authApi.getOAuthUrl(provider);

    window.location.href = url;
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Redirect to Google with email hint
    const googleUrl = authApi.getOAuthUrl("google");
    const urlWithEmail = `${googleUrl}?login_hint=${encodeURIComponent(email)}`;
    window.location.href = urlWithEmail;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to Exegent
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in to save your conversations and access them anywhere
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Input */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="w-full hover:bg-transparent hover:text-current hover:border-current cursor-pointer"
              disabled={!email || isSubmitting}
            >
              <Icon
                icon="mdi:email-outline"
                className="h-6 w-6 scale-125 -translate-y-px"
              />
              Continue with Email
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* OAuth Providers */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 hover:bg-transparent hover:text-current hover:border-current cursor-pointer"
              onClick={() => handleOAuthLogin("google")}
            >
              <span className="flex items-center justify-center h-5 w-5">
                <Icon
                  icon="logos:google-icon"
                  className="h-5 w-5 scale-110 -translate-y-px"
                />
              </span>
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 hover:bg-transparent hover:text-current hover:border-current cursor-pointer"
              onClick={() => handleOAuthLogin("github")}
            >
              <span className="flex items-center justify-center h-5 w-5">
                <Icon
                  icon="octicon:mark-github-16"
                  className="h-5 w-5 scale-110 -translate-y-px"
                />
              </span>
              Continue with GitHub
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground px-8">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
