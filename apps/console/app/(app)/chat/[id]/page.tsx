import { notFound } from "next/navigation";

import { ChatShell } from "@/components/chat/chat-shell";
import { serverFetch } from "@/lib/server-fetch";
import type {
  AgentRow,
  ConversationDetail,
  ConversationSummary
} from "@/lib/types";

export const metadata = { title: "Chat · Evarx Console" };
export const dynamic = "force-dynamic";

export default async function ChatByIdPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let detail: ConversationDetail | null = null;
  let conversations: ConversationSummary[] = [];
  let agents: AgentRow[] = [];

  try {
    [detail, conversations, agents] = await Promise.all([
      serverFetch<ConversationDetail>(`/v1/conversations/${id}`),
      serverFetch<ConversationSummary[]>("/v1/conversations"),
      serverFetch<AgentRow[]>("/v1/agents")
    ]);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
      <ChatShell
        conversations={conversations}
        agents={agents}
        initialConversation={detail}
      />
    </div>
  );
}
