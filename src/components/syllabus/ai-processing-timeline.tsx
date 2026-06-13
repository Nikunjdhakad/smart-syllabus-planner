"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ProcessingStage =
  | "uploaded"
  | "analyzing"
  | "extracting"
  | "creating"
  | "completed";

interface AIProcessingTimelineProps {
  currentStage?: ProcessingStage;
  progress?: number;
}

export function AIProcessingTimeline({
  currentStage = "analyzing",
  progress = 0,
}: AIProcessingTimelineProps) {
  const stages: { id: ProcessingStage; label: string }[] = [
    { id: "uploaded", label: "Uploaded" },
    { id: "analyzing", label: "Analyzing" },
    { id: "extracting", label: "Extracting Subjects" },
    { id: "creating", label: "Creating Topics" },
    { id: "completed", label: "Completed" },
  ];

  const currentIndex = stages.findIndex((s) => s.id === currentStage);

  const getStageStatus = (index: number) => {
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "pending";
  };

  return (
    <div className="space-y-6 rounded-xl border border-border/60 bg-card p-6">
      <div>
        <h2 className="text-xl font-semibold">AI Processing Your Syllabus</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Currently: {stages[currentIndex]?.label}...
        </p>
      </div>

      {/* Timeline */}
      <div className="flex items-center justify-between gap-2">
        {stages.map((stage, index) => {
          const status = getStageStatus(index);
          return (
            <div key={stage.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border-2",
                    status === "completed" &&
                      "border-emerald-500 bg-emerald-500/10",
                    status === "current" && "border-primary bg-primary/10",
                    status === "pending" && "border-border bg-muted"
                  )}
                >
                  {status === "completed" && (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  )}
                  {status === "current" && (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs",
                    status === "pending" && "text-muted-foreground"
                  )}
                >
                  {stage.label}
                </span>
              </div>
              {index < stages.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1",
                    index < currentIndex ? "bg-emerald-500" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-right text-xs text-muted-foreground">{progress}%</p>
      </div>
    </div>
  );
}
