"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Shield } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Are we underinsured for our net worth?",
  "What's missing from our estate documents?",
  "Summarize our financial picture.",
  "What should we tackle first in our plan?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${msg}` };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="px-4 lg:px-6 py-4 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-teal/15 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-teal" />
        </div>
        <div>
          <h1 className="font-bold text-foreground leading-tight">Vault Assistant</h1>
          <p className="text-xs text-muted-foreground">
            Grounded in your family&apos;s vault
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="text-center mt-10 space-y-6">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-navy/10 items-center justify-center">
              <Shield className="w-7 h-7 text-navy" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Ask about your family&apos;s readiness
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                I can review your accounts, insurance, documents, and plan — and
                suggest what to do next.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-sm px-3 py-2 rounded-lg border border-border bg-card hover:bg-background text-foreground transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary text-white px-4 py-2.5 text-sm whitespace-pre-wrap"
                  : "max-w-[90%] rounded-2xl rounded-bl-sm bg-card border border-border text-foreground px-4 py-2.5 text-sm whitespace-pre-wrap"
              }
            >
              {m.content || (loading && i === messages.length - 1 ? "Thinking…" : "")}
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="px-4 lg:px-6 py-4 border-t border-border"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            rows={1}
            placeholder="Ask about your accounts, insurance, documents…"
            className="flex-1 resize-none px-3 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent max-h-32"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition disabled:opacity-40 shrink-0"
            aria-label="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 text-center">
          General guidance only — not legal, tax, or investment advice.
        </p>
      </form>
    </div>
  );
}
