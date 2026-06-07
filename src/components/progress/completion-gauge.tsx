"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

type Props = { percentage: number; completedTasks: number; totalTasks: number };

function getColor(pct: number) {
  if (pct >= 80) return "#10B981";
  if (pct >= 50) return "#7C3AED";
  if (pct >= 25) return "#F59E0B";
  return "#EF4444";
}

export function CompletionGauge({ percentage, completedTasks, totalTasks }: Props) {
  const color = getColor(percentage);
  const chartData = [{ value: percentage, fill: color }];

  return (
    <div className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
      <div className="mb-1 text-[1.0625rem] font-semibold text-foreground">Overall completion</div>
      <div className="mb-4 text-sm text-muted-foreground">{completedTasks} of {totalTasks} tasks done</div>
      <div className="relative mx-auto w-fit">
        <ResponsiveContainer width={200} height={200}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="68%" outerRadius="100%" startAngle={90} endAngle={-270} data={chartData}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: "var(--muted)" }}
              dataKey="value"
              cornerRadius={10}
              angleAxisId={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums" style={{ color, letterSpacing: "-0.04em" }}>{percentage}%</span>
          <span className="text-xs text-muted-foreground mt-0.5">complete</span>
        </div>
      </div>
    </div>
  );
}
