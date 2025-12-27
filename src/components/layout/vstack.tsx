import { ReactNode } from "react";

interface VStackProps {
  children: ReactNode;
  className?: string;
}

export function VStack({
  children,
  className = "",
}: VStackProps) {
  return (
    <div
      className={`flex flex-col ${className}`}
    >
      {children}
    </div>
  );
}
