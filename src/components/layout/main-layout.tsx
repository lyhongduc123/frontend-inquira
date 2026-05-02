"use client";

import { VStack } from "@/components/layout/vstack";
import { LeftSidebar } from "@/app/_components/LeftSidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarManager,
  SidebarManagerProvider,
} from "@/components/ui/sidebar";
import { AuthInitializer } from "./test";
import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";

interface MainLayoutProps {
  children: React.ReactNode;
  initialUser?: any | null;
}

export function MainLayout({
  children,
  initialUser,
}: MainLayoutProps) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser]);

  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);
  return (
    <>
      {/* <AuthInitializer initialAuthenticated={!!initialUser} /> */}
      <SidebarManagerProvider>
        <SidebarProvider defaultOpen={true}>
          <SidebarManager name="left">
            <LeftSidebar />
          </SidebarManager>

          <SidebarInset>
            <VStack className="h-screen overflow-hidden gap-0">
              {children}
            </VStack>
          </SidebarInset>
        </SidebarProvider>
      </SidebarManagerProvider>
    </>
  );
}
