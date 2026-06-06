"use client";

import { Bot, X } from "lucide-react";
import { useCopilot } from "@/components/copilot/copilot-store";
import { cn } from "@/lib/utils";

export function CopilotFab() {
  const { open, toggle, messages } = useCopilot();
  const hasMessages = messages.length > 0;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={open ? "Close AI Copilot" : "Open AI Copilot"}
      aria-expanded={open}
      className={cn(
        // Base layout
        "fixed bottom-6 right-6 z-50 flex items-center justify-center",
        "size-14 rounded-full",
        // Glassmorphism base
        "border border-primary/30 bg-background/80 backdrop-blur-xl",
        // Shadow + glow
        "shadow-xl shadow-primary/25",
        // Transition
        "transition-all duration-300 ease-out",
        // Hover lift
        "hover:-translate-y-1 hover:scale-105 hover:shadow-2xl hover:shadow-primary/40 hover:border-primary/60",
        // Active press
        "active:scale-95",
        // Open state — filled
        open && "bg-primary border-primary shadow-primary/50",
      )}
    >
      {/* Animated pulse rings */}
      {!open && (
        <>
          <span
            className="absolute inset-0 rounded-full bg-primary/20 animate-[copilot-pulse_2s_ease-out_infinite]"
            aria-hidden
          />
          <span
            className="absolute inset-0 rounded-full bg-primary/10 animate-[copilot-pulse_2s_ease-out_0.6s_infinite]"
            aria-hidden
          />
        </>
      )}

      {/* Gradient fill on closed state */}
      {!open && (
        <span
          className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/90 to-violet-600/80"
          aria-hidden
        />
      )}

      {/* Unread dot */}
      {hasMessages && !open && (
        <span
          className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-background"
          aria-label={`${messages.filter((m) => m.role === "assistant").length} messages`}
        >
          AI
        </span>
      )}

      {/* Icon */}
      <span className="relative z-10">
        {open ? (
          <X className="size-5 text-primary-foreground" strokeWidth={2.5} />
        ) : (
          <Bot className="size-6 text-primary-foreground" strokeWidth={1.75} />
        )}
      </span>
    </button>
  );
}
