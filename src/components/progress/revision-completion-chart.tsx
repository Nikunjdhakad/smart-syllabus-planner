"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { RevisionListResponse } from "@/types/revision";
import { ChartReveal } from "@/components/motion/chart-reveal";

type Props = { revisions: RevisionListResponse };

const COLORS = ["#34d399", "rgba(148,163,184,0.4)", "#f87171"];

export function RevisionCompletionChart({ revisions }: Props) {
  const completed = revisions.completed.length;
  const upcoming = revisions.upcoming.length;
  const missed = revisions.missed.length;
  const total = completed + upcoming + missed;

  const chartData = [
    { name: "Completed", value: completed },
    { name: "Upcoming", value: upcoming },
    { name: "Missed", value: missed },
  ].filter((d) => d.value > 0);

  return (
    <ChartReveal delay={0.25}>
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-1 text-sm font-semibold">Revision completion</div>
        <div className="text-xs text-muted-foreground mb-4">
          {total > 0 ? `${completed} of ${total} revisions completed` : "No revisions scheduled yet"}
        </div>
        {total === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Complete topics to generate revision sessions
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.name === "Completed" ? COLORS[0] : entry.name === "Upcoming" ? COLORS[1] : COLORS[2]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => [v, "revisions"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "#1f2937", color: "#f1f5f9", fontSize: "12px" }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartReveal>
  );
}
