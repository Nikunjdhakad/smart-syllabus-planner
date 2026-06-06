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
    <div className="flex gap-2.5 fade-in-up">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
        <Bot className="size-3.5 text-primary" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-border/60 bg-card px-3.5 py-2.5">
        <span className="typing-dot size-1.5 rounded-full bg-primary/60" />
        <span className="typing-dot size-1.5 rounded-full bg-primary/60" />
        <span className="typing-dot size-1.5 rounded-full bg-primary/60" />
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────
function CopilotEmptyState({ onSelect }: { onSelect: (t: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-start gap-5 overflow-y-auto px-4 pb-4 pt-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-primary/25 blur-xl" aria-hidden />
          <div className="relative flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5">
            <Bot className="size-7 text-primary" strokeWidth={1.5} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            <p className="text-sm font-bold">AI Copilot</p>
          </div>
          <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-muted-foreground">
            Your study brain. Ask me anything — I have all your academic data.
          </p>
        </div>
      </div>

      {/* Quick action grid */}
      <div className="w-full space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          Quick actions
        </p>
        <div className="grid grid-cols-1 gap-1.5">
          {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(label)}
              className={cn(
                "flex items-center gap-2.5 rounded-card-sm border border-border/50 bg-card/60 px-3 py-2",
                "text-left text-xs font-medium text-muted-foreground",
                "transition-all duration-150 hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
              )}
            >
              <Icon className="size-3.5 shrink-0 text-primary/60" aria-hidden />
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
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  return (
    <div
      className={cn(
        "flex items-end gap-2 rounded-card-sm border border-border/60 bg-card px-3 py-2.5",
        "transition-all duration-200 focus-within:border-primary/50 focus-within:shadow-sm focus-within:shadow-primary/10",
      )}
    >
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => { onChange(e.target.value); autoResize(); }}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything… (Enter to send)"
        disabled={disabled}
        aria-label="Ask the AI copilot"
        className="flex-1 resize-none bg-transparent text-xs leading-relaxed outline-none placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50 max-h-28 min-h-[1.25rem]"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        aria-label="Send"
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
          value.trim() && !disabled
            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30 hover:scale-105"
            : "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
        )}
      >
        {/* Arrow up icon inline to avoid another import */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}

// ── Main drawer ──────────────────────────────────────────────────
export function CopilotDrawer() {
  const { open, setOpen, messages, input, loading, error, setInput, sendMessage, clearChat } = useCopilot();
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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

  return (
    <>
      {/* Backdrop — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Drawer panel */}
      <aside
        role="complementary"
        aria-label="AI Copilot"
        className={cn(
          // Positioning — fixed right, above the FAB
          "fixed bottom-0 right-0 z-40 flex flex-col",
          // Size — full-height on mobile, panel on desktop
          "h-[100dvh] w-full sm:h-[calc(100dvh-1rem)] sm:w-[420px] sm:bottom-4 sm:right-24 sm:rounded-card",
          // Background — glassmorphism
          "border border-border/70 bg-background/95 backdrop-blur-2xl shadow-2xl shadow-black/30",
          // Slide animation via transform
          "transition-all duration-300 ease-out",
          open
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-[110%] opacity-0 pointer-events-none",
        )}
      >
        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2.5">
            {/* Animated brain orb */}
            <div className="relative flex size-8 items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md animate-[copilot-pulse_3s_ease-in-out_infinite]" aria-hidden />
              <div className="relative flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-violet-600/20 border border-primary/20">
                <Bot className="size-4 text-primary" strokeWidth={1.75} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold leading-none">AI Copilot</p>
                <span className="flex size-1.5 rounded-full bg-emerald-500" aria-label="Online" />
              </div>
              <p className="text-[10px] text-muted-foreground">Your academic brain</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {hasMessages && (
              <button
                type="button"
                onClick={clearChat}
                aria-label="Clear chat"
                title="Clear chat"
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close AI Copilot"
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* ── Messages / Empty state ── */}
        <div className="relative min-h-0 flex-1 overflow-y-auto">
          {!hasMessages ? (
            <CopilotEmptyState onSelect={(t) => void sendMessage(t)} />
          ) : (
            <div className="space-y-3 p-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mx-4 mb-2 rounded-card-sm border border-destructive/30 bg-destructive/8 px-3 py-2 text-xs text-destructive" role="alert">
            {error}
          </div>
        )}

        {/* ── Quick actions strip (when chatting) ── */}
        {hasMessages && !loading && (
          <div className="shrink-0 overflow-x-auto border-t border-border/40 px-4 py-2">
            <div className="flex gap-1.5">
              {QUICK_ACTIONS.slice(0, 4).map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => void sendMessage(label)}
                  className="flex shrink-0 items-center gap-1.5 rounded-chip border border-border/50 bg-card/60 px-2.5 py-1 text-[10px] font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  <Icon className="size-3 shrink-0" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input ── */}
        <div className="shrink-0 border-t border-border/60 p-3">
          <CopilotInput
            value={input}
            onChange={setInput}
            onSubmit={() => void sendMessage(input)}
            disabled={loading}
          />
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground/50">
            AI has access to your full academic data
          </p>
        </div>
      </aside>
    </>
  );
}
