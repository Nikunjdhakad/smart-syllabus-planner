"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SubjectProgressSlice } from "@/types/progress";
import { ChartReveal } from "@/components/motion/chart-reveal";

type Props = { bySubject: SubjectProgressSlice[] };

export function SubjectProgressChart({ bySubject }: Props) {
  const chartData = bySubject.map((s) => ({
    name: s.subjectName.length > 12 ? s.subjectName.slice(0, 12) + "…" : s.subjectName,
    fullName: s.subjectName,
    Completed: s.completedTasks,
    Remaining: s.totalTasks - s.completedTasks,
  }));

  return (
    <ChartReveal delay={0.2}>
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-1 text-sm font-semibold">Subject-wise progress</div>
        <div className="text-xs text-muted-foreground mb-4">Completed vs remaining tasks per subject</div>
        {chartData.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No subject data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "#1f2937", color: "#f1f5f9", fontSize: "12px" }}
                labelFormatter={(_, p) => p?.[0]?.payload?.fullName ?? ""}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="Completed" fill="#818cf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Remaining" fill="rgba(148,163,184,0.2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartReveal>
  );
}
