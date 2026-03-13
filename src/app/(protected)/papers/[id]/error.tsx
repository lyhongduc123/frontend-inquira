import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { refresh } from "next/cache";

export default function PaperError({ error }: { error: unknown }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Error loading paper.</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>
          {error instanceof Error
            ? error.message
            : "Some error occurred while fetching the paper details."}
        </EmptyDescription>
        <Button onClick={() => refresh()}>Retry</Button>
      </EmptyContent>
    </Empty>
  );
}
