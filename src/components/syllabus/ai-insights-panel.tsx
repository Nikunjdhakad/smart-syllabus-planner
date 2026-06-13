"use client";

import { Target, TrendingUp, BookOpen, Zap } from "lucide-react";

interface Subject {
  subjectId: string;
  subjectName: string;
  topics: Array<{ difficulty: number }>;
}

interface AIInsightsPanelProps {
  subjects?: Subject[];
}

export function AIInsightsPanel({ subjects = [] }: AIInsightsPanelProps) {
  if (subjects.length === 0) {
    return null;
  }

  // Calculate insights
  const mostDifficult = subjects.reduce((max, subject) => {
    const avgDifficulty =
      subject.topics.reduce((sum, t) => sum + t.difficulty, 0) /
      subject.topics.length;
    const maxAvgDifficulty =
      max.topics.reduce((sum, t) => sum + t.difficulty, 0) / max.topics.length;
    return avgDifficulty > maxAvgDifficulty ? subject : max;
  }, subjects[0]);

  const largest = subjects.reduce((max, subject) =>
    subject.topics.length > max.topics.length ? subject : max
  );

  const quickest = subjects.reduce((min, subject) => {
    const studyHours = subject.topics.reduce(
      (sum, t) => sum + t.difficulty * 2,
      0
    );
    const minStudyHours = min.topics.reduce(
      (sum, t) => sum + t.difficulty * 2,
      0
    );
    return studyHours < minStudyHours ? subject : min;
  });

  const insights = [
    {
      icon: Target,
      title: "Recommended Focus",
      description: `${mostDifficult.subjectName} (highest difficulty)`,
    },
    {
      icon: TrendingUp,
      title: "Most Difficult",
      description: mostDifficult.subjectName,
    },
    {
      icon: BookOpen,
      title: "Largest Subject",
      description: `${largest.subjectName} (${largest.topics.length} topics)`,
    },
    {
      icon: Zap,
      title: "Quickest Subject",
      description: quickest.subjectName,
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">AI Insights</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {insights.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-xl border border-border/60 bg-amber-50/50 p-4 dark:bg-amber-950/20"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                <Icon className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
