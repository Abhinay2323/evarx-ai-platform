"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Bot, FileText, Loader2, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import type { Citation } from "@/lib/types";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  citations?: Citation[];
  streaming?: boolean;
  error?: string;
}

function uid() {
  return Math.random().toString(36).slice(2);
}

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const canSubmit = input.trim().length > 0 && !sending;

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: uid(), role: "user", content: text };
    const assistantId = uid();
    const placeholder: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true
    };

    setMessages((prev) => [...prev, userMsg, placeholder]);
    setInput("");
    setSending(true);

    try {
      const supabase = createClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Session expired. Refresh and try again.");
      }

      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch(`${BASE}/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ messages: history })
      });
      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => "");
        throw new Error(detail || `Chat failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n\n")) !== -1) {
          const event = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 2);
          const dataLine = event
            .split("\n")
            .find((l) => l.startsWith("data: "));
          if (!dataLine) continue;
          const json = dataLine.slice(6).trim();
          if (!json) continue;
          let payload: Record<string, unknown>;
          try {
            payload = JSON.parse(json);
          } catch {
            continue;
          }

          if (payload.type === "citations") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, citations: payload.citations as Citation[] }
                  : m
              )
            );
          } else if (payload.type === "token") {
            const delta = String(payload.delta ?? "");
            if (!delta) continue;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + delta } : m
              )
            );
          } else if (payload.type === "error") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      streaming: false,
                      error: String(payload.message ?? "Upstream error")
                    }
                  : m
              )
            );
          } else if (payload.type === "done") {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))
            );
          }
        }
      }

      // In case the stream ended without an explicit done.
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Chat failed";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, streaming: false, error: msg } : m
        )
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-2xl border border-white/10 bg-ink-900/60">
      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.map((m) => (
              <ChatBubble key={m.id} message={m} />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 bg-ink-900/80 p-3 sm:p-4">
        <form
          className="mx-auto flex max-w-3xl items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (canSubmit) void send();
              }
            }}
            rows={1}
            placeholder="Ask a question grounded in your uploaded documents…"
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-ink-800/60 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-helix-400/40 focus:ring-2 focus:ring-helix-400/20"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-helix-400 to-plasma-500 text-ink-950 transition hover:brightness-110",
              !canSubmit && "pointer-events-none opacity-50"
            )}
            aria-label="Send"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="rounded-full border border-white/10 bg-white/5 p-3 text-helix-300">
        <Bot className="h-6 w-6" />
      </div>
      <h2 className="text-base font-semibold text-white">Ask your documents</h2>
      <p className="text-sm text-zinc-500">
        Upload a few documents on the Documents page, then ask questions here. Every
        answer is cited from the chunks it retrieved.
      </p>
    </div>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const citations = useMemo(() => message.citations ?? [], [message.citations]);

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10",
          isUser ? "bg-plasma-500/20 text-plasma-200" : "bg-helix-500/15 text-helix-200"
        )}
      >
        {isUser ? <UserIcon className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-plasma-500/20 text-zinc-50"
              : "border border-white/10 bg-ink-800/60 text-zinc-100"
          )}
        >
          {message.content || (message.streaming ? <StreamingDots /> : null)}
          {message.streaming && message.content ? <StreamingCursor /> : null}
          {message.error ? (
            <p className="mt-2 text-xs text-red-300">{message.error}</p>
          ) : null}
        </div>

        {!isUser && citations.length > 0 ? (
          <div className="mt-2 flex flex-col gap-1.5">
            {citations.map((c) => (
              <div
                key={c.n}
                className="flex items-start gap-2 rounded-lg border border-white/10 bg-ink-800/40 px-3 py-2 text-xs"
              >
                <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-helix-400/40 bg-helix-400/10 px-1 font-mono text-[10px] text-helix-200">
                  {c.n}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <FileText className="h-3 w-3" />
                    <span className="truncate" title={c.document_filename}>
                      {c.document_filename}
                    </span>
                    <span className="text-zinc-600">· chunk #{c.chunk_index}</span>
                  </div>
                  <p className="mt-1 text-zinc-500">{c.snippet}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StreamingDots() {
  return (
    <span className="inline-flex items-center gap-1 text-zinc-500">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-helix-400" />
      <span
        className="h-1.5 w-1.5 animate-pulse rounded-full bg-helix-400"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="h-1.5 w-1.5 animate-pulse rounded-full bg-helix-400"
        style={{ animationDelay: "300ms" }}
      />
    </span>
  );
}

function StreamingCursor() {
  return <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-helix-400" />;
}
