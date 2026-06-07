"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

/* These colors work in both light and dark — vibrant enough for light bg */
const STATUS_COLORS: Record<string, string> = {
  pending:     "#94A3B8",
  in_progress: "#7C3AED",
  completed:   "#10B981",
  missed:      "#EF4444",
  "Pending":     "#94A3B8",
  "In Progress": "#7C3AED",
  "Completed":   "#10B981",
  "Missed":      "#EF4444",
};

const LABELS: Record<string, string> = {
  pending: "Pending", in_progress: "In Progress", completed: "Completed", missed: "Missed",
};

type Props = { labels: string[]; data: number[] };

export function CompletionDonut({ labels, data }: Props) {
  const chartData = labels
    .map((label, i) => ({ name: LABELS[label] ?? label, value: data[i] ?? 0, key: label }))
    .filter((d) => d.value > 0);
  const total = data.reduce((s, v) => s + v, 0);

  return (
    <div className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
      <div className="mb-1 text-[1.0625rem] font-semibold text-foreground">Task breakdown</div>
      <div className="mb-4 text-sm text-muted-foreground">Distribution by status</div>
      {total === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No tasks yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={STATUS_COLORS[entry.key] ?? STATUS_COLORS[entry.name] ?? "#7C3AED"} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number) => [v, "tasks"]}
              contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", fontSize: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", color: "var(--foreground)" }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
