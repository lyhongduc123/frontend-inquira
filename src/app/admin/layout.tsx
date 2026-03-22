import type { ReactNode } from "react";
import { AdminSidebar } from "./_components/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "./_components/Header";
import { Box } from "@/components/layout/box";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <SidebarProvider>
        <AdminSidebar />
        <Box className="flex-1 overflow-auto">{children}</Box>
      </SidebarProvider>
    </div>
  );
}
