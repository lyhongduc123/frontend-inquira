import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export default function GlobalNotFound() {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyTitle>404 Not Found</EmptyTitle>
                <EmptyDescription>
                    The page you are looking for does not exist or has been removed.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    )
}