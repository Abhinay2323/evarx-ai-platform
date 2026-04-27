"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquareText,
  X,
  Sparkles,
  Send,
  Cpu,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { chatSuggestions, greetings, type ChatSuggestion } from "@/lib/chat-script";
import { cn } from "@/lib/cn";
import { API_URL, apiAvailable } from "@/lib/api";

interface Message {
  id: string;
  from: "agent" | "user";
  text: string;
  citations?: ChatSuggestion["citations"];
  streaming?: boolean;
}

export function ChatTeaser() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hooks must be called unconditionally and in the same order on every
  // render. The /console early return must sit AFTER every hook below.
  useEffect(() => {
    if (!open || messages.length > 0) return;
    let cancelled = false;
    (async () => {
      for (const line of greetings) {
        if (cancelled) return;
        await streamMessage(line, setMessages);
        await delay(180);
      }
      if (!cancelled) setIntroDone(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  if (pathname?.startsWith("/console")) return null;

  async function pickSuggestion(s: ChatSuggestion) {
    if (busy) return;
    setBusy(true);
    setMessages((m) => [
      ...m,
      { id: `u-${Date.now()}`, from: "user", text: s.prompt }
    ]);

    if (apiAvailable()) {
      // Real backend: stream Claude Haiku via the /v1/public/chat endpoint
      // and treat any error as a fall-back to the canned response below.
      try {
        await streamFromBackend(s.prompt, setMessages, s.citations);
        setBusy(false);
        return;
      } catch (err) {
        // fall through to mock so the marketing page never looks broken
        console.warn("public chat failed, using mock", err);
      }
    }

    await delay(550);
    await streamMessage(s.response, setMessages, s.citations);
    setBusy(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Open chat preview"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-900/80 px-4 py-3 text-sm text-zinc-200 shadow-glow backdrop-blur transition hover:bg-ink-800"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulseRing rounded-full bg-helix-400" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-helix-400" />
        </span>
        <MessageSquareText className="h-4 w-4" />
        Try the demo agent
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key="chat"
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="fixed inset-x-4 bottom-4 top-auto z-40 mx-auto flex max-h-[80vh] w-auto max-w-md flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-900/95 shadow-glow backdrop-blur-xl sm:right-5 sm:bottom-5 sm:left-auto sm:w-[400px]"
      >
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-helix-400 to-plasma-500 text-ink-950">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Evarx demo agent</p>
              <p className="flex items-center gap-1.5 text-[11px] text-helix-300">
                <Cpu className="h-3 w-3" /> Evarx-Med-3B · CPU · demo
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="rounded-md border border-white/10 p-1.5 text-zinc-300 hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
          {messages.map((m) => (
            <ChatBubble key={m.id} message={m} />
          ))}
          {busy ? <Typing /> : null}
        </div>

        <div className="border-t border-white/10 px-4 py-3">
          {introDone ? (
            <div className="grid gap-2">
              {chatSuggestions.map((s) => (
                <button
                  key={s.label}
                  disabled={busy}
                  onClick={() => pickSuggestion(s)}
                  className={cn(
                    "group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-xs text-zinc-200 transition hover:border-helix-400/30 hover:bg-helix-500/[0.06]",
                    busy && "pointer-events-none opacity-60"
                  )}
                >
                  <span className="flex-1">{s.label}</span>
                  <Send className="h-3.5 w-3.5 text-helix-300 transition group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <span className="h-1 w-1 animate-pulse rounded-full bg-helix-400" />
              Loading suggested prompts…
            </div>
          )}

          <p className="mt-3 flex items-center gap-1.5 text-[10px] text-zinc-500">
            <ShieldCheck className="h-3 w-3 text-helix-400" />
            Demo only. Responses illustrate platform capabilities.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isAgent = message.from === "agent";
  return (
    <div className={cn("flex flex-col gap-2", isAgent ? "items-start" : "items-end")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isAgent
            ? "border border-white/10 bg-white/[0.04] text-zinc-100"
            : "bg-helix-500 text-ink-950"
        )}
      >
        {message.text}
        {message.streaming ? <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-helix-300" /> : null}
      </div>
      {message.citations && message.citations.length > 0 ? (
        <div className="ml-1 max-w-[85%] space-y-1.5">
          {message.citations.map((c, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/10 bg-ink-800/60 px-3 py-2 text-[11px] text-zinc-400"
            >
              <p className="flex items-center gap-1.5 font-mono text-helix-300">
                <ExternalLink className="h-3 w-3" /> {c.source}
              </p>
              <p className="mt-1 line-clamp-2 italic text-zinc-500">{c.excerpt}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Typing() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 w-fit">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-helix-400 [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-helix-400 [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-helix-400" />
    </div>
  );
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

async function streamMessage(
  text: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  citations?: ChatSuggestion["citations"]
) {
  const id = `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  setMessages((m) => [...m, { id, from: "agent", text: "", streaming: true }]);

  const tokens = text.split(/(\s+)/);
  let buf = "";
  for (const tok of tokens) {
    buf += tok;
    setMessages((m) =>
      m.map((msg) => (msg.id === id ? { ...msg, text: buf } : msg))
    );
    await delay(28 + Math.random() * 30);
  }
  setMessages((m) =>
    m.map((msg) =>
      msg.id === id ? { ...msg, streaming: false, citations } : msg
    )
  );
}

async function streamFromBackend(
  prompt: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  citations?: ChatSuggestion["citations"]
) {
  const id = `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  setMessages((m) => [...m, { id, from: "agent", text: "", streaming: true }]);

  const res = await fetch(`${API_URL}/v1/public/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }]
    })
  });
  if (!res.ok || !res.body) throw new Error(`backend ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  let buf = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    pending += decoder.decode(value, { stream: true });

    // SSE frames are delimited by blank lines
    const frames = pending.split(/\n\n/);
    pending = frames.pop() ?? "";

    for (const frame of frames) {
      const line = frame.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      const data = line.slice(6).trim();
      if (!data) continue;
      try {
        const evt = JSON.parse(data);
        if (evt.type === "token" && typeof evt.delta === "string") {
          buf += evt.delta;
          setMessages((m) =>
            m.map((msg) => (msg.id === id ? { ...msg, text: buf } : msg))
          );
        } else if (evt.type === "error") {
          throw new Error(evt.message ?? "stream error");
        }
      } catch {
        // ignore malformed frame
      }
    }
  }

  setMessages((m) =>
    m.map((msg) =>
      msg.id === id ? { ...msg, streaming: false, citations } : msg
    )
  );
}
