import { HStack } from "@/components/layout/hstack";

export function LoadingDots() {
  return (
    <HStack className="space-x-1 items-center text-muted-foreground gap-1">
      <span className="animate-bounce">•</span>
      <span className="animate-bounce delay-100">•</span>
      <span className="animate-bounce delay-200">•</span>
    </HStack>
  );
}
