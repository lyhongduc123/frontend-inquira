"use client";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useAuthStore } from "@/store/auth-store";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, Settings2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
  viewMode?: "conversation" | "reading";
  onViewModeChange?: (mode: "conversation" | "reading") => void;
}

export function Header({ viewMode = "conversation", onViewModeChange }: HeaderProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        {/* Left section - Tabs for conversation views */}
        <div className="flex items-center gap-4">
          <Tabs value={viewMode} onValueChange={(value) => onViewModeChange?.(value as "conversation" | "reading")}>
            <TabsList className="h-9">
              <TabsTrigger value="conversation" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Conversation</span>
              </TabsTrigger>
              <TabsTrigger value="reading" className="gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Reading Mode</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Right section - Controls */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings2 className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
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
