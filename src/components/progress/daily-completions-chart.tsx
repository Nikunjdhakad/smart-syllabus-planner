"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyCompletionPoint } from "@/types/progress";

type Props = { dailyCompletions: DailyCompletionPoint[] };

function fmt(dateStr: string) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DailyCompletionsChart({ dailyCompletions }: Props) {
  const chartData = dailyCompletions.map((p) => ({ date: fmt(p.date), Tasks: p.completedCount }));
  const hasData = chartData.some((d) => d.Tasks > 0);

  return (
    <div className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
      <div className="mb-1 text-[1.0625rem] font-semibold text-foreground">Tasks completed over time</div>
      <div className="mb-4 text-sm text-muted-foreground">Daily completions — last 14 days</div>
      {!hasData ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Complete tasks to see your activity
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", fontSize: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
              formatter={(v: number) => [v, "tasks completed"]}
            />
            <Area type="monotone" dataKey="Tasks" stroke="#7C3AED" strokeWidth={2.5} fill="url(#compGrad)" dot={false} activeDot={{ r: 5, fill: "#7C3AED" }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
