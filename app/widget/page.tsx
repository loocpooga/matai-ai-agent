"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

// Ledger palette (matches mataitech.co)
const C = {
  page: "#DFEAD8",
  paper: "#F8FBF6",
  band: "#E9F1E3",
  ink: "#14201A",
  muted: "#5B6C60",
  rule: "#B3C8AB",
  deep: "#0E4A33",
};

const SUGGESTIONS = [
  "What does Luke actually do?",
  "How does pricing work?",
  "Would this work with my CRM?",
];

const GREETING =
  "Hey, I'm Fin. Luke built me to answer questions about what he does. I'm also a working example of it. Ask me anything about the services, the process, or whether your setup would fit.";

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    let sid = sessionStorage.getItem("fin-session");
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem("fin-session", sid);
    }
    sessionIdRef.current = sid;
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, isLoading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          sessionId: sessionIdRef.current,
        }),
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Request failed");
      }

      // Stream: newline-delimited JSON events
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const append = (delta: string) =>
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content: next[next.length - 1].content + delta,
          };
          return next;
        });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.t === "delta") append(event.v);
            if (event.t === "error") append(event.v);
          } catch {
            // skip malformed line
          }
        }
      }
    } catch (error) {
      const msg =
        error instanceof Error && error.message !== "Request failed"
          ? error.message
          : "Something went wrong. Try again, or email luke@mataitech.co.";
      setMessages((prev) => {
        const next = [...prev];
        if (next[next.length - 1]?.role === "assistant" && !next[next.length - 1].content) {
          next[next.length - 1] = { role: "assistant", content: msg };
          return next;
        }
        return [...next, { role: "assistant", content: msg }];
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClose = () => {
    window.parent.postMessage({ type: "CLOSE_CHAT" }, "*");
  };

  return (
    <div
      className="flex flex-col h-screen"
      style={{
        background: C.paper,
        fontFamily: "var(--font-plex-sans), sans-serif",
        color: C.ink,
      }}
    >
      {/* Masthead */}
      <div
        className="px-4 pt-3 pb-2.5 flex items-end justify-between"
        style={{ background: C.page, borderBottom: `1.5px solid ${C.ink}` }}
      >
        <div className="flex items-baseline gap-2">
          <span
            style={{
              fontFamily: "var(--font-zilla), serif",
              fontWeight: 700,
              fontSize: 19,
              letterSpacing: "-0.02em",
            }}
          >
            Fin<span style={{ color: C.deep }}>.</span>
          </span>
          <span
            style={{
              fontFamily: "var(--font-plex-mono), monospace",
              fontSize: 9,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: C.muted,
            }}
          >
            Luke&apos;s assistant · not a human
          </span>
        </div>
        <button
          onClick={handleClose}
          aria-label="Close chat"
          className="w-7 h-7 flex items-center justify-center transition-colors"
          style={{ border: `1px solid ${C.rule}`, borderRadius: 2, color: C.muted }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.ink)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.rule)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Greeting */}
        <div
          className="text-sm leading-relaxed px-3 py-2.5"
          style={{
            background: C.band,
            border: `1px solid ${C.rule}`,
            borderRadius: 2,
            maxWidth: "88%",
          }}
        >
          {GREETING}
        </div>

        {messages.length === 0 && (
          <div className="space-y-2 pt-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="block w-full text-left text-sm px-3 py-2 transition-colors"
                style={{
                  background: C.paper,
                  border: `1px solid ${C.rule}`,
                  borderRadius: 2,
                  color: C.deep,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.deep)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.rule)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div
                className="text-sm leading-relaxed px-3 py-2.5"
                style={{
                  background: C.deep,
                  color: C.paper,
                  borderRadius: 2,
                  maxWidth: "88%",
                }}
              >
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex">
              <div
                className="text-sm leading-relaxed px-3 py-2.5 fin-markdown"
                style={{
                  background: C.band,
                  border: `1px solid ${C.rule}`,
                  borderRadius: 2,
                  maxWidth: "88%",
                }}
              >
                {m.content ? (
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                ) : (
                  <span style={{ color: C.muted }}>…</span>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3" style={{ borderTop: `1px solid ${C.rule}`, background: C.paper }}>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about services, process, fit..."
            maxLength={1000}
            className="flex-1 text-sm px-3 py-2.5 outline-none"
            style={{
              background: "#FFFFFF",
              border: `1px solid ${C.rule}`,
              borderRadius: 2,
              color: C.ink,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = C.deep)}
            onBlur={(e) => (e.currentTarget.style.borderColor = C.rule)}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="text-sm font-medium px-4 py-2.5 transition-colors disabled:opacity-50"
            style={{ background: C.deep, color: C.paper, borderRadius: 2 }}
          >
            {isLoading ? "…" : "Send"}
          </button>
        </form>
        <div
          className="pt-2 text-center"
          style={{
            fontFamily: "var(--font-plex-mono), monospace",
            fontSize: 8.5,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: C.muted,
          }}
        >
          Fin can get things wrong · the 30-min call with Luke is free
        </div>
      </div>
    </div>
  );
}
