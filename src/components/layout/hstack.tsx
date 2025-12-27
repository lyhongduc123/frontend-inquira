import { ReactNode } from "react";

interface HStackProps {
  children: ReactNode;
  gap?: string;       // Tailwind spacing class, e.g., "2", "4", "6"
  align?: string;     // Tailwind items-* classes, e.g., "center", "start", "end"
  justify?: string;   // Tailwind justify-* classes, e.g., "start", "center", "between"
  className?: string;
}

export function HStack({ children, gap = "2", align = "center", justify = "start", className = "" }: HStackProps) {
  return (
    <div className={`flex flex-row items-${align} justify-${justify} gap-${gap} ${className}`}>
      {children}
    </div>
  );
}
