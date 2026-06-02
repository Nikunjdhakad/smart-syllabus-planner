"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { ChatInput } from "@/components/assistant/chat-input";
import { ChatMessage, type Message } from "@/components/assistant/chat-message";
import { QuickActions } from "@/components/assistant/quick-actions";
import { cn } from "@/lib/utils";

async function readApiError(res: Response): Promise<string> {
  try {
    const b = await res.json();
    return typeof b.error === "string" ? b.error : "Request failed";
  } catch { return "Request failed"; }
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 fade-in-up">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-primary/10 text-primary">
        <Bot className="size-4" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border/60 bg-card px-4 py-3">
        <span className="typing-dot size-2 rounded-full bg-primary/60" />
        <span className="typing-dot size-2 rounded-full bg-primary/60" />
        <span className="typing-dot size-2 rounded-full bg-primary/60" />
      </div>
    </div>
  );
}

function EmptyState({ onSelect }: { onSelect: (t: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
      {/* Icon */}
      <div className="relative">
        <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl" aria-hidden />
        <div className="relative flex size-20 items-center justify-center rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5">
          <Bot className="size-9 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      <div className="max-w-sm space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="font-bold text-lg">AI Study Assistant</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Ask anything about your syllabus, study plan, or exam prep.
          I have access to all your academic data.
        </p>
      </div>

      <QuickActions onSelect={onSelect} />
    </div>
  );
}

export function ChatWindow({ initialQuestion }: { initialQuestion?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialSent = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuestion && !initialSent.current) {
      initialSent.current = true;
      void sendMessage(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });
      if (!res.ok) throw new Error(await readApiError(res));
      const body = await res.json();
      const reply = body.data?.reply as string;
      if (!reply) throw new Error("No response received");
      setMessages((p) => [...p, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[500px] flex-col gap-3">
      {/* Message area */}
      <div
        className={cn(
          "flex-1 overflow-y-auto rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm",
          !hasMessages && "flex items-center justify-center",
        )}
      >
        {!hasMessages ? (
          <EmptyState onSelect={(t) => void sendMessage(t)} />
        ) : (
          <div className="space-y-4 p-5">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-2.5 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Quick actions when chatting */}
      {hasMessages && !loading && (
        <QuickActions onSelect={(t) => void sendMessage(t)} />
      )}

      {/* Input */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={() => void sendMessage(input)}
        disabled={loading}
      />
    </div>
  );
}
