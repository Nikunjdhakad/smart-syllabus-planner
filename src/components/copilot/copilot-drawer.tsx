"use client";

import { useEffect, useRef } from "react";
import {
  Bot,
  Sparkles,
  Trash2,
  X,
  BookOpen,
  CalendarCheck,
  Flame,
  LifeBuoy,
  RotateCcw,
  ShieldAlert,
  BarChart2,
  ArrowUp,
} from "lucide-react";
import { useCopilot } from "@/components/copilot/copilot-store";
import { ChatMessage } from "@/components/assistant/chat-message";
import { cn } from "@/lib/utils";

// ── Quick actions ────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "What to study today?",  icon: BookOpen },
  { label: "Exam readiness",        icon: CalendarCheck },
  { label: "Weakest subject",       icon: Flame },
  { label: "Generate crash plan",   icon: LifeBuoy },
  { label: "Revision status",       icon: RotateCcw },
  { label: "Recovery suggestions",  icon: ShieldAlert },
  { label: "Progress summary",      icon: BarChart2 },
] as const;

// ── Typing indicator ─────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-3 fade-in-up">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
        <Bot className="size-4 text-primary" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border/60 bg-card px-4 py-3">
        <span className="typing-dot size-2 rounded-full bg-primary/60" />
        <span className="typing-dot size-2 rounded-full bg-primary/60" />
        <span className="typing-dot size-2 rounded-full bg-primary/60" />
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────
function CopilotEmptyState({ onSelect }: { onSelect: (t: string) => void }) {
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8 px-4 py-10 mx-auto">
      {/* Hero icon */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-primary/25 blur-2xl" aria-hidden />
          <div className="relative flex size-20 items-center justify-center rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/25 to-violet-600/15">
            <Bot className="size-10 text-primary" strokeWidth={1.5} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-xl font-bold">AI Copilot</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Your academic brain. Ask me anything — I have access to your full syllabus,
            study plan, progress, revisions, and recovery data.
          </p>
        </div>
      </div>

      {/* Quick action grid */}
      <div className="w-full space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 text-center">
          Quick actions
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(label)}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3",
                "text-left text-sm font-medium text-muted-foreground",
                "transition-all duration-150 hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
                "shadow-sm hover:shadow-md hover:shadow-primary/5",
              )}
            >
              <Icon className="size-4 shrink-0 text-primary/60" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Input bar ────────────────────────────────────────────────────
function CopilotInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSubmit();
    }
  }

  function autoResize() {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div
      className={cn(
        "flex items-end gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3",
        "shadow-lg transition-all duration-200",
        "focus-within:border-primary/40 focus-within:shadow-primary/8 focus-within:shadow-xl",
      )}
    >
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => { onChange(e.target.value); autoResize(); }}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about your studies… (Enter to send)"
        disabled={disabled}
        aria-label="Ask the AI copilot"
        className="flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50 max-h-40 min-h-[1.5rem]"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        aria-label="Send"
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
          value.trim() && !disabled
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:scale-105 hover:shadow-primary/40"
            : "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
        )}
      >
        <ArrowUp className="size-4" />
      </button>
    </div>
  );
}

// ── Full-workspace copilot overlay ───────────────────────────────
export function CopilotDrawer() {
  const { open, setOpen, messages, input, loading, error, setInput, sendMessage, clearChat } = useCopilot();
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [messages, loading, open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Full-screen backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-md transition-all duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Full-workspace panel — centred content column like ChatGPT */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="AI Copilot"
        className={cn(
          // Full viewport coverage, above backdrop
          "fixed inset-0 z-50 flex flex-col",
          // Smooth enter / exit
          "transition-all duration-300 ease-out",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none",
        )}
        // Stop clicks on the panel from bubbling to the backdrop
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Inner card — positioned like a centred app window ── */}
        <div
          className={cn(
            // Centred column with a maximum width, full height with margins
            "relative mx-auto flex h-full w-full max-w-4xl flex-col",
            // On desktop: inset card with rounded corners and shadow
            "lg:my-6 lg:rounded-2xl lg:shadow-2xl lg:shadow-black/20",
            // Surface
            "border border-border/60 bg-background",
          )}
        >
          {/* ── Ambient glow bar at top ── */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-primary/40 to-transparent"
            aria-hidden
          />

          {/* ── Header ── */}
          <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-3">
              {/* Animated brain orb */}
              <div className="relative flex size-9 items-center justify-center">
                <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md animate-[copilot-pulse_3s_ease-in-out_infinite]" aria-hidden />
                <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-violet-600/20 border border-primary/20">
                  <Bot className="size-4.5 text-primary" strokeWidth={1.75} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold leading-none">AI Copilot</p>
                  <span className="flex size-2 rounded-full bg-emerald-500" aria-label="Online" />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">Your academic brain · has all your data</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {hasMessages && (
                <button
                  type="button"
                  onClick={clearChat}
                  aria-label="Clear conversation"
                  title="Clear conversation"
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Trash2 className="size-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close AI Copilot"
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* ── Messages / Empty state — scrollable ── */}
          <div className="relative min-h-0 flex-1 overflow-y-auto">
            {!hasMessages ? (
              <div className="flex min-h-full items-center justify-center py-8">
                <CopilotEmptyState onSelect={(t) => void sendMessage(t)} />
              </div>
            ) : (
              <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-6 sm:px-6">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {loading && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div
              className="mx-4 mb-2 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-2.5 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* ── Quick actions strip (when chatting) ── */}
          {hasMessages && !loading && (
            <div className="shrink-0 overflow-x-auto border-t border-border/40 px-4 py-2.5">
              <div className="mx-auto flex max-w-2xl gap-2">
                {QUICK_ACTIONS.slice(0, 5).map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => void sendMessage(label)}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border/50 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  >
                    <Icon className="size-3 shrink-0" aria-hidden />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Input area ── */}
          <div className="shrink-0 border-t border-border/60 px-4 py-4 sm:px-6">
            <div className="mx-auto max-w-2xl">
              <CopilotInput
                value={input}
                onChange={setInput}
                onSubmit={() => void sendMessage(input)}
                disabled={loading}
              />
              <p className="mt-2 text-center text-xs text-muted-foreground/50">
                AI has access to your full academic data · Esc to close
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
