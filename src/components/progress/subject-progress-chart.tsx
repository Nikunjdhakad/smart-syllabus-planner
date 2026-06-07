"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SubjectProgressSlice } from "@/types/progress";

type Props = { bySubject: SubjectProgressSlice[] };

export function SubjectProgressChart({ bySubject }: Props) {
  const chartData = bySubject.map((s) => ({
    name: s.subjectName.length > 12 ? s.subjectName.slice(0, 12) + "…" : s.subjectName,
    fullName: s.subjectName,
    Completed: s.completedTasks,
    Remaining: s.totalTasks - s.completedTasks,
  }));

  return (
    <div className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
      <div className="mb-1 text-[1.0625rem] font-semibold text-foreground">Subject-wise progress</div>
      <div className="mb-4 text-sm text-muted-foreground">Completed vs remaining per subject</div>
      {chartData.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No subject data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", fontSize: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
              labelFormatter={(_, p) => p?.[0]?.payload?.fullName ?? ""}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", color: "var(--foreground)" }} />
            <Bar dataKey="Completed" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Remaining" fill="var(--muted)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
