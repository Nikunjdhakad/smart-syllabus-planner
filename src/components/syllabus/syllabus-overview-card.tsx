"use client";

import { BookOpen, FileText, Clock, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SyllabusOverviewCardProps {
  subjectsCount?: number;
  topicsCount?: number;
  estimatedHours?: number;
  estimatedWeeks?: number;
}

export function SyllabusOverviewCard({
  subjectsCount = 0,
  topicsCount = 0,
  estimatedHours = 0,
  estimatedWeeks = 0,
}: SyllabusOverviewCardProps) {
  const metrics = [
    {
      icon: BookOpen,
      label: "Subjects Detected",
      value: subjectsCount,
    },
    {
      icon: FileText,
      label: "Topics Detected",
      value: topicsCount,
    },
    {
      icon: Clock,
      label: "Estimated Study Hours",
      value: `${estimatedHours} hours`,
    },
    {
      icon: Calendar,
      label: "Estimated Completion",
      value: `${estimatedWeeks} weeks`,
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Syllabus at a Glance</h2>
      <Card className="overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-primary/5 to-primary/10 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {metrics.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                <Icon className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
