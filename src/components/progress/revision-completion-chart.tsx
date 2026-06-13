"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { RevisionListResponse } from "@/types/revision";
import { ChartTooltip } from "@/components/progress/chart-tooltip";

const COLORS = ["#10B981", "#94A3B8", "#EF4444"];

type Props = { revisions: RevisionListResponse };

export function RevisionCompletionChart({ revisions }: Props) {
  const completed = revisions.completed.length;
  const upcoming  = revisions.upcoming.length;
  const missed    = revisions.missed.length;
  const total     = completed + upcoming + missed;

  const chartData = [
    { name: "Completed", value: completed },
    { name: "Upcoming",  value: upcoming },
    { name: "Missed",    value: missed },
  ].filter((d) => d.value > 0);

  return (
    <div className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
      <div className="mb-1 text-[1.0625rem] font-semibold text-foreground">Revision completion</div>
      <div className="mb-4 text-sm text-muted-foreground">
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
                <Cell
                  key={entry.name}
                  fill={entry.name === "Completed" ? COLORS[0] : entry.name === "Upcoming" ? COLORS[1] : COLORS[2]}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip unit="revisions" />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", color: "var(--foreground)" }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
