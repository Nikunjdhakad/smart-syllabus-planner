"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  pending: "rgba(148,163,184,0.4)",
  in_progress: "#818cf8",
  completed: "#34d399",
  missed: "#f87171",
  "In Progress": "#818cf8",
  "Completed": "#34d399",
  "Pending": "rgba(148,163,184,0.4)",
  "Missed": "#f87171",
};

const LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  missed: "Missed",
};

type Props = { labels: string[]; data: number[] };

export function CompletionDonut({ labels, data }: Props) {
  const chartData = labels
    .map((label, i) => ({ name: LABELS[label] ?? label, value: data[i] ?? 0, key: label }))
    .filter((d) => d.value > 0);

  const total = data.reduce((s, v) => s + v, 0);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 text-sm font-semibold">Task breakdown</div>
      <div className="text-xs text-muted-foreground mb-4">Distribution by status</div>
      {total === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No tasks yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={STATUS_COLORS[entry.key] ?? STATUS_COLORS[entry.name] ?? "#818cf8"} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number) => [v, "tasks"]}
              contentStyle={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "#1f2937", color: "#f1f5f9", fontSize: "12px" }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
