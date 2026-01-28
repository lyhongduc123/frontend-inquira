"use client";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useAuthStore } from "@/store/auth-store";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, Settings2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { HStack } from "../layout/hstack";

interface HeaderProps {
  viewMode?: "conversation" | "reading";
  onViewModeChange?: (mode: "conversation" | "reading") => void;
  children?: React.ReactNode;
}

export function Header({
  viewMode = "conversation",
  onViewModeChange,
  children,
}: HeaderProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  return (
    <>
      <HStack className="items-center justify-between border-b bg-background/95 px-6 py-3 backdrop-blur supports-backdrop-filter:bg-background/60 gap-4">
        <HStack className="items-center gap-2">
          {children}
          <LeftSection viewMode={viewMode} onViewModeChange={onViewModeChange} />
        </HStack>
        <RightSection
          isAuthenticated={isAuthenticated}
          onSignInClick={() => setIsAuthDialogOpen(true)}
        />
      </HStack>
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
      />
    </>
  );
}

interface LeftSectionProps {
  viewMode: "conversation" | "reading";
  onViewModeChange?: (mode: "conversation" | "reading") => void;
}

const LeftSection = ({ viewMode, onViewModeChange }: LeftSectionProps) => {
  return (
    <HStack className="gap-4">
      <Tabs
        value={viewMode}
        onValueChange={(value) =>
          onViewModeChange?.(value as "conversation" | "reading")
        }
      >
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
    </HStack>
  );
};

interface RightSectionProps {
  isAuthenticated: boolean;
  onSignInClick: () => void;
}

const RightSection = ({
  isAuthenticated,
  onSignInClick,
}: RightSectionProps) => {
  return (
    <HStack className="items-center gap-2">
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
          onClick={onSignInClick}
        >
          Sign In
        </Button>
      )}
    </HStack>
  );
};
