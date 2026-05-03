import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { ChatWindow } from "@/components/chat/chat-window";

export const metadata = { title: "Chat · Evarx Console" };
export const dynamic = "force-dynamic";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-white/10 bg-ink-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-display font-bold text-white">
            Evarx Console
          </Link>
          <div className="flex items-center gap-4 text-sm text-zinc-300">
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-zinc-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-white">Chat</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Ask questions over your uploaded documents. Answers are cited from the
            retrieved chunks.
          </p>
        </div>

        <ChatWindow />
      </main>
    </div>
  );
}
