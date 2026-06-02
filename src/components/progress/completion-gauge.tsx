"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

type Props = { percentage: number; completedTasks: number; totalTasks: number };

function getColor(pct: number) {
  if (pct >= 80) return "#34d399"; // emerald
  if (pct >= 50) return "#818cf8"; // indigo
  if (pct >= 25) return "#fbbf24"; // amber
  return "#f87171"; // red
}

export function CompletionGauge({ percentage, completedTasks, totalTasks }: Props) {
  const color = getColor(percentage);
  const chartData = [{ value: percentage, fill: color }];

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 text-sm font-semibold">Overall completion</div>
      <div className="text-xs text-muted-foreground mb-4">{completedTasks} of {totalTasks} tasks done</div>
      <div className="relative mx-auto w-fit">
        <ResponsiveContainer width={200} height={200}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="68%" outerRadius="100%" startAngle={90} endAngle={-270} data={chartData}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: "rgba(255,255,255,0.05)" }}
              dataKey="value"
              cornerRadius={10}
              angleAxisId={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-4xl font-bold tabular-nums")} style={{ color }}>{percentage}%</span>
          <span className="text-xs text-muted-foreground">complete</span>
        </div>
      </div>
    </div>
  );
}
