import { ChatShell } from "@/components/chat/chat-shell";
import { serverFetch } from "@/lib/server-fetch";
import type { AgentRow, ConversationSummary } from "@/lib/types";

export const metadata = { title: "Chat · Evarx Console" };
export const dynamic = "force-dynamic";

export default async function ChatPage() {
  let conversations: ConversationSummary[] = [];
  let agents: AgentRow[] = [];
  try {
    [conversations, agents] = await Promise.all([
      serverFetch<ConversationSummary[]>("/v1/conversations"),
      serverFetch<AgentRow[]>("/v1/agents")
    ]);
  } catch {
    /* fall through with empty arrays */
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
      <ChatShell conversations={conversations} agents={agents} />
    </div>
  );
}
