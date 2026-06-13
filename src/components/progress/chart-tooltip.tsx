"use client";

/**
 * ChartTooltip — a custom Recharts tooltip content component.
 *
 * Renders inside the React tree so Tailwind utility classes and CSS
 * variables (--card, --foreground, --border) always resolve to the
 * correct theme values in both light and dark mode, regardless of how
 * Recharts mounts the tooltip node.
 *
 * Usage (pass as JSX element to Tooltip's content prop):
 *   <Tooltip content={<ChartTooltip unit="tasks" />} />
 *   <Tooltip content={<ChartTooltip unit="tasks" labelPayloadKey="fullName" />} />
 *
 * Note: `active`, `payload`, and `label` are injected by Recharts at
 * runtime. They are not passed directly in JSX — all are therefore optional
 * in the type signature so TypeScript doesn't complain at the call site.
 */

import type { Payload, ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

interface ChartTooltipProps {
  // ── Injected by Recharts at runtime ──────────────────────────
  active?: boolean;
  payload?: Payload<ValueType, NameType>[];
  label?: string | number;
  // ── User-provided configuration ──────────────────────────────
  /** Suffix shown after the numeric value, e.g. "tasks" or "revisions" */
  unit?: string;
  /**
   * When set, reads this key from `payload[0].payload` instead of the
   * axis label. Useful when the axis shows a truncated name but the full
   * name lives in the data record (e.g. "fullName").
   */
  labelPayloadKey?: string;
}

export function ChartTooltip({ active, payload, label, unit, labelPayloadKey }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  // Prefer the full name from the data record when a key is specified
  const resolvedLabel: string =
    labelPayloadKey && payload[0]?.payload?.[labelPayloadKey] != null
      ? String(payload[0].payload[labelPayloadKey])
      : label != null
        ? String(label)
        : "";

  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5 shadow-lg min-w-[100px] text-xs font-medium text-foreground">
      {/* Label row */}
      {resolvedLabel !== "" && (
        <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground truncate max-w-[180px]">
          {resolvedLabel}
        </p>
      )}

      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            {/* Colour swatch */}
            <span
              className="inline-block size-2 rounded-full shrink-0"
              style={{ background: String(entry.color ?? entry.fill ?? "#7C3AED") }}
              aria-hidden
            />
            {String(entry.name ?? "")}
          </span>
          <span className="tabular-nums text-foreground font-semibold">
            {Number(entry.value).toLocaleString()}
            {unit ? <span className="ml-1 text-muted-foreground font-normal">{unit}</span> : null}
          </span>
        </div>
      ))}
    </div>
  );
}
