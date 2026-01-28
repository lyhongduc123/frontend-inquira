import { TypographyP } from "@/components/global/typography";
import { VStack } from "@/components/layout/vstack";

export function LoadingState() {
  return (
    <VStack className="flex-1 items-center justify-center">
      <div className="space-y-2 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <TypographyP variant="muted" size="sm">Loading messages...</TypographyP>
      </div>
    </VStack>
  );
}
