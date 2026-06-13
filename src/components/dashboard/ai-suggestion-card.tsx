"use client";

import { Bot, BookOpen, CalendarCheck, LifeBuoy, RotateCcw, Sparkles } from "lucide-react";
import { useCopilot } from "@/components/copilot/copilot-store";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { label: "What to study today?", icon: BookOpen },
  { label: "Can I finish before exam?", icon: CalendarCheck },
  { label: "Generate crash plan", icon: LifeBuoy },
  { label: "Revisions due?", icon: RotateCcw },
] as const;

export function AiSuggestionCard() {
  const { setOpen, sendMessage } = useCopilot();

  function openCopilot() {
    setOpen(true);
  }

  function openWithQuestion(label: string) {
    setOpen(true);
    void sendMessage(label);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl" aria-hidden />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/15">
              <Bot className="size-4 text-primary" />
            </div>
            <h2 className="font-semibold">AI Copilot</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Get personalized guidance, crash plans, and daily study suggestions instantly.
          </p>
        </div>
        <button
          type="button"
          onClick={openCopilot}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20"
        >
          <Sparkles className="size-3.5" />
          Open Copilot
        </button>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-2">
        {QUICK_LINKS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => openWithQuestion(label)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border border-border/60 bg-background/60 px-3 py-1.5",
              "text-xs font-medium transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
            )}
          >
            <Icon className="size-3.5 shrink-0 text-primary/70" aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
