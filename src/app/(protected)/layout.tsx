import { ProtectedRoute } from "@/components/auth";
import { useAuth } from "@/hooks/use-auth";
import { cookies } from "next/headers";

export default function ProtectedRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
