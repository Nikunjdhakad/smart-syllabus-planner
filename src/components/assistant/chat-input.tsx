"use client";

import { useRef } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatInput({
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

  function handleInput() {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div
      className={cn(
        "flex items-end gap-2 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-lg",
        "transition-all duration-200 focus-within:border-primary/40 focus-within:shadow-primary/10",
      )}
    >
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="Ask anything about your studies… (Enter to send)"
        disabled={disabled}
        aria-label="Chat message"
        className={cn(
          "flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none",
          "placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50",
          "max-h-40 min-h-[1.5rem]",
        )}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
          value.trim() && !disabled
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:scale-105"
            : "bg-muted text-muted-foreground cursor-not-allowed",
        )}
      >
        <ArrowUp className="size-4" />
      </button>
    </div>
  );
}
