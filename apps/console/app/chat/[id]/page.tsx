import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
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
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-white/10 bg-ink-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-display font-bold text-white">
            Evarx Console
          </Link>
          <div className="flex items-center gap-4 text-sm text-zinc-300">
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-6 pt-6 sm:px-6">
        <Link
          href="/chat"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-zinc-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Chats
        </Link>

        <ChatShell
          conversations={conversations}
          agents={agents}
          initialConversation={detail}
        />
      </main>
    </div>
  );
}
