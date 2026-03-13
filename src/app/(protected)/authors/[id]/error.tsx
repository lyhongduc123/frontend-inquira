import {
  Empty,
  EmptyHeader,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthorError() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <AlertTriangle className="size-12 text-destructive" />
        </EmptyMedia>
        <EmptyTitle>Failed to load author details</EmptyTitle>
        <EmptyDescription>
          An error occurred while fetching the author information. Please try
          again later.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </EmptyContent>
    </Empty>
  );
}
