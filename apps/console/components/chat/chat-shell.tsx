"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUp,
  Bot,
  ChevronDown,
  FileText,
  Loader2,
  MessageSquarePlus,
  Trash2,
  User as UserIcon
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import type {
  AgentRow,
  Citation,
  ConversationDetail,
  ConversationSummary
} from "@/lib/types";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

type Role = "user" | "assistant";

interface UiMessage {
  id: string;
  role: Role;
  content: string;
  citations?: Citation[];
  streaming?: boolean;
  error?: string;
}

interface Props {
  conversations: ConversationSummary[];
  agents: AgentRow[];
  initialConversation?: ConversationDetail | null;
}

function uid() {
  return Math.random().toString(36).slice(2);
}

async function authHeader() {
  const supabase = createClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) return null;
  return `Bearer ${session.access_token}`;
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ChatShell({ conversations, agents, initialConversation }: Props) {
  const router = useRouter();
  const [convList, setConvList] = useState<ConversationSummary[]>(conversations);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversation?.id ?? null
  );
  const [agentId, setAgentId] = useState<string | null>(
    initialConversation?.agent_id ?? null
  );
  const [messages, setMessages] = useState<UiMessage[]>(
    (initialConversation?.messages ?? []).map((m) => ({
      id: m.id,
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
      citations: m.citations
    }))
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  const canSubmit = input.trim().length > 0 && !sending;
  const activeAgent = useMemo(
    () => agents.find((a) => a.id === agentId) ?? null,
    [agents, agentId]
  );

  const refreshConvList = useCallback(async () => {
    const auth = await authHeader();
    if (!auth) return;
    const res = await fetch(`${BASE}/v1/conversations`, {
      headers: { Authorization: auth },
      cache: "no-store"
    });
    if (res.ok) {
      const data = (await res.json()) as ConversationSummary[];
      setConvList(data);
    }
  }, []);

  async function ensureConversation(): Promise<string | null> {
    if (conversationId) return conversationId;
    const auth = await authHeader();
    if (!auth) return null;
    const res = await fetch(`${BASE}/v1/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify({ agent_id: agentId })
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ConversationSummary;
    setConversationId(data.id);
    setConvList((prev) => [data, ...prev]);
    // Update URL without triggering a full nav.
    window.history.replaceState(null, "", `/chat/${data.id}`);
    return data.id;
  }

  async function send() {
    const text = input.trim();
    if (!text) return;

    const userMsg: UiMessage = { id: uid(), role: "user", content: text };
    const assistantId = uid();
    const placeholder: UiMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true
    };

    setMessages((prev) => [...prev, userMsg, placeholder]);
    setInput("");
    setSending(true);

    try {
      const auth = await authHeader();
      if (!auth) throw new Error("Session expired. Refresh and try again.");

      const convId = await ensureConversation();
      if (!convId) throw new Error("Could not create conversation");

      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch(`${BASE}/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          Authorization: auth
        },
        body: JSON.stringify({
          messages: history,
          conversation_id: convId,
          agent_id: agentId
        })
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
          const dataLine = event.split("\n").find((l) => l.startsWith("data: "));
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

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))
      );
      // Background refresh so the title (auto-derived from first user turn) shows up.
      void refreshConvList();
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

  function newChat() {
    setConversationId(null);
    setMessages([]);
    setInput("");
    window.history.replaceState(null, "", "/chat");
  }

  async function deleteConversation(id: string) {
    if (!window.confirm("Delete this conversation? This cannot be undone.")) return;
    const auth = await authHeader();
    if (!auth) return;
    const res = await fetch(`${BASE}/v1/conversations/${id}`, {
      method: "DELETE",
      headers: { Authorization: auth }
    });
    if (res.ok) {
      setConvList((prev) => prev.filter((c) => c.id !== id));
      if (id === conversationId) newChat();
      router.refresh();
    }
  }

  return (
    <div className="grid h-[calc(100vh-9rem)] gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="hidden flex-col rounded-2xl border border-white/10 bg-ink-900/60 lg:flex">
        <button
          type="button"
          onClick={newChat}
          className="flex items-center justify-center gap-2 border-b border-white/10 px-3 py-3 text-sm text-zinc-200 transition hover:bg-white/5"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </button>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {convList.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-zinc-600">
              No conversations yet.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {convList.map((c) => {
                const isActive = c.id === conversationId;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/chat/${c.id}`}
                      className={cn(
                        "group flex items-start gap-2 rounded-lg px-2 py-2 text-xs transition",
                        isActive
                          ? "bg-helix-400/10 text-helix-100"
                          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                      )}
                    >
                      <span className="flex-1 truncate">{c.title}</span>
                      <span className="text-[10px] text-zinc-600">
                        {fmtTime(c.updated_at)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          void deleteConversation(c.id);
                        }}
                        className="hidden h-5 w-5 items-center justify-center rounded text-zinc-500 hover:bg-red-500/10 hover:text-red-300 group-hover:flex"
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <div className="flex flex-col rounded-2xl border border-white/10 bg-ink-900/60">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <AgentPicker
            agents={agents}
            activeAgent={activeAgent}
            onChange={setAgentId}
            disabled={messages.length > 0}
          />
          {activeAgent ? (
            <span className="text-[11px] text-zinc-500">
              {activeAgent.document_ids.length} doc{activeAgent.document_ids.length === 1 ? "" : "s"} in scope
            </span>
          ) : (
            <span className="text-[11px] text-zinc-500">All org documents</span>
          )}
        </div>

        <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {messages.length === 0 ? (
            <EmptyState agent={activeAgent} />
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
              placeholder={
                activeAgent
                  ? `Ask ${activeAgent.name}…`
                  : "Ask a question grounded in your uploaded documents…"
              }
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
    </div>
  );
}

function AgentPicker({
  agents,
  activeAgent,
  onChange,
  disabled
}: {
  agents: AgentRow[];
  activeAgent: AgentRow | null;
  onChange: (id: string | null) => void;
  disabled: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-xs text-zinc-400">
      <Bot className="h-3.5 w-3.5 text-helix-300" />
      Agent
      <div className="relative">
        <select
          value={activeAgent?.id ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={disabled}
          className="appearance-none rounded-lg border border-white/10 bg-ink-800/60 py-1.5 pl-3 pr-7 text-xs text-zinc-200 outline-none focus:border-helix-400/40 disabled:opacity-60"
        >
          <option value="" className="bg-ink-900">
            Default (all docs)
          </option>
          {agents.map((a) => (
            <option key={a.id} value={a.id} className="bg-ink-900">
              {a.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
      </div>
    </label>
  );
}

function EmptyState({ agent }: { agent: AgentRow | null }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="rounded-full border border-white/10 bg-white/5 p-3 text-helix-300">
        <Bot className="h-6 w-6" />
      </div>
      <h2 className="text-base font-semibold text-white">
        {agent ? `Ask ${agent.name}` : "Ask your documents"}
      </h2>
      <p className="text-sm text-zinc-500">
        {agent?.description ??
          "Type a question below. Answers are cited from the chunks the system retrieves from your documents."}
      </p>
    </div>
  );
}

function ChatBubble({ message }: { message: UiMessage }) {
  const isUser = message.role === "user";
  const citations = message.citations ?? [];

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
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
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
