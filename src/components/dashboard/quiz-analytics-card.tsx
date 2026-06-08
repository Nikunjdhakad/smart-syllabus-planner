"use client";

import { useEffect, useState } from "react";
import { Award, TrendingUp, AlertCircle, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizAnalytics } from "@/types/quiz";

export function QuizAnalyticsCard() {
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const response = await fetch("/api/quiz/analytics");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data.analytics);
      }
    } catch (error) {
      console.error("Failed to fetch quiz analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <div className="skeleton h-6 w-40 rounded mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-20 rounded-xl" />
          <div className="skeleton h-20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!analytics || analytics.totalQuizzes === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="border-b border-border/60 bg-gradient-to-r from-primary/10 to-transparent px-6 py-4">
        <div className="flex items-center gap-2">
          <Award className="size-5 text-primary" />
          <h2 className="text-sm font-semibold">Knowledge Verification</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Based on {analytics.totalQuizzes} quiz{analytics.totalQuizzes !== 1 ? "zes" : ""} completed
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border/60 bg-gradient-to-br from-primary/5 to-transparent p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="size-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground">Accuracy</p>
            </div>
            <p className="text-2xl font-bold tabular-nums text-primary">
              {analytics.knowledgeAccuracy}%
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-gradient-to-br from-emerald-500/5 to-transparent p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="size-4 text-emerald-500" />
              <p className="text-xs font-medium text-muted-foreground">Mastered</p>
            </div>
            <p className="text-2xl font-bold tabular-nums text-emerald-500">
              {analytics.masteredTopics}
            </p>
          </div>
        </div>

        {/* Strong Topics */}
        {analytics.strongTopics.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="size-4 text-emerald-500" />
              <p className="text-xs font-semibold">Strong Topics</p>
            </div>
            <div className="space-y-1">
              {analytics.strongTopics.slice(0, 3).map((topic, idx) => (
                <div
                  key={idx}
                  className="text-xs px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weak Topics */}
        {analytics.weakTopics.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="size-4 text-amber-500" />
              <p className="text-xs font-semibold">Needs Improvement</p>
            </div>
            <div className="space-y-1">
              {analytics.weakTopics.slice(0, 3).map((topic, idx) => (
                <div
                  key={idx}
                  className="text-xs px-2 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20"
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subject Performance */}
        {analytics.subjectPerformance.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-2">Subject Performance</p>
            <div className="space-y-2">
              {analytics.subjectPerformance.slice(0, 3).map((subject) => (
                <div key={subject.subjectId} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {subject.subjectName}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-border/40">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          subject.averageScore >= 80 ? "bg-emerald-500" :
                          subject.averageScore >= 60 ? "bg-primary" : "bg-amber-500"
                        )}
                        style={{ width: `${subject.averageScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold tabular-nums w-8 text-right">
                      {subject.averageScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
