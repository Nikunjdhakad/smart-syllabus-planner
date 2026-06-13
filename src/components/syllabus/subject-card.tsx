"use client";

import { BookOpen, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Topic {
  topicId: string;
  topicName: string;
  difficulty: number;
}

interface SubjectCardProps {
  subjectId: string;
  subjectName: string;
  topics: Topic[];
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function SubjectCard({
  subjectId,
  subjectName,
  topics,
  isExpanded = false,
  onToggle,
}: SubjectCardProps) {
  const topicCount = topics.length;
  const avgDifficulty =
    topicCount > 0
      ? Math.round(
          topics.reduce((sum, t) => sum + t.difficulty, 0) / topicCount
        )
      : 0;
  const studyHours = topics.reduce((sum, t) => sum + t.difficulty * 2, 0);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border transition-colors",
        isExpanded
          ? "border-primary/30 bg-primary/5"
          : "border-border/60 bg-card hover:bg-muted/30"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15">
            <BookOpen className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{subjectName}</h3>
            <p className="text-sm text-muted-foreground">
              📖 {topicCount} topics • ⚡ Difficulty {avgDifficulty}/5 • ⏱️{" "}
              {studyHours}h
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "size-5 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-border/60 p-4">
          <p className="mb-3 text-sm font-medium">Topics:</p>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <div
                key={topic.topicId}
                className="rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm"
              >
                {topic.topicName}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
