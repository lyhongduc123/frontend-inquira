"use client";

import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useAuthStore } from "@/store/auth-store";
import { useState } from "react";

export function Header() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 gap-4 border-b border-border">
        <Brand showText />
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsAuthDialogOpen(true)}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
      />
    </>
  );
}
