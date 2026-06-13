"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicChipProps {
  topicId: string;
  topicName: string;
  difficulty: number;
}

export function TopicChip({ topicId, topicName, difficulty }: TopicChipProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/80 px-3 py-2 transition-shadow hover:shadow-md">
      <span className="flex-1 truncate text-sm">{topicName}</span>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "size-3",
              i < difficulty
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}
