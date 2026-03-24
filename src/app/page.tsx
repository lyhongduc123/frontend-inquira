import { ChatPageClient } from "@/app/_components/ChatPageClient";

export default function ChatPage({
  searchParams,
}: {
  searchParams: { launch?: string };
}) {
  const { launch } = searchParams;
  return <ChatPageClient launchKeyFromQuery={launch} />;
}
