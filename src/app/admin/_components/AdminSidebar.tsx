"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Database,
  Users,
  Building2,
  FileText,
  TestTube2,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { TypographyH2 } from "@/components/global/typography";
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Authors", href: "/admin/authors", icon: Users },
  { name: "Institutions", href: "/admin/institutions", icon: Building2 },
  { name: "Preprocessing", href: "/admin/preprocessing", icon: FileText },
  { name: "LLM Validation", href: "/admin/validation", icon: TestTube2 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="w-64">
      <SidebarHeader className="p-4">
        <TypographyH2>Admin Panel</TypographyH2>
      </SidebarHeader>
      <SidebarContent className="p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Item
              key={item.name}
              asChild
              className={isActive ? "bg-primary font-medium" : ""}
            >
              <Link href={item.href}>
                <ItemMedia variant="icon">
                  <item.icon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{item.name}</ItemTitle>
                </ItemContent>
                <ItemActions>
                    <ChevronRight className="h-4 w-4" />
                </ItemActions>
              </Link>
            </Item>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
