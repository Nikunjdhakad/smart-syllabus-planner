/**
 * Feature: design-system-overhaul
 * Property 5: Icon colour tokens meet WCAG non-text contrast (≥ 3:1)
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4
 *
 * Light mode: StatCard icons use the *-600 Tailwind shade for sufficient contrast
 * on the white --card surface. Dark mode: *-400 shades are used, which meet 3:1
 * against the dark --card surface.
 *
 * Tailwind colour approximations in OKLCH:
 *   emerald-600 ≈ oklch(0.53 0.16 145)
 *   amber-600   ≈ oklch(0.58 0.18 85)
 *   rose-600    ≈ oklch(0.50 0.20 25)
 *   cyan-700    ≈ oklch(0.45 0.14 200)
 *   emerald-400 ≈ oklch(0.70 0.16 145)
 *   amber-400   ≈ oklch(0.74 0.14 85)
 *   rose-400    ≈ oklch(0.68 0.20 25)
 *   cyan-400    ≈ oklch(0.68 0.14 200)
 */
import fc from "fast-check";
import { describe, it, expect } from "vitest";
import { computeContrastRatio } from "../colour-utils";

const ICON_PAIRS = [
  // Light-mode StatCard icons (uses *-600 for 3:1 on white --card)
  { icon: "oklch(0.52 0.22 270)",  bg: "oklch(1 0.002 264)",    label: "primary icon vs --card (light)" },
  { icon: "oklch(0.53 0.16 145)",  bg: "oklch(1 0.002 264)",    label: "emerald-600 icon vs --card (light)" },
  { icon: "oklch(0.50 0.16 85)",   bg: "oklch(1 0.002 264)",    label: "amber-700 icon vs --card (light)" },
  { icon: "oklch(0.50 0.20 25)",   bg: "oklch(1 0.002 264)",    label: "rose-600 icon vs --card (light)" },
  { icon: "oklch(0.45 0.14 200)",  bg: "oklch(1 0.002 264)",    label: "cyan-700 icon vs --card (light)" },
  // Dark-mode StatCard icons (uses *-400 shades on dark --card)
  { icon: "oklch(0.68 0.22 270)",  bg: "oklch(0.14 0.012 264)", label: "primary icon vs --card (dark)" },
  { icon: "oklch(0.70 0.16 145)",  bg: "oklch(0.14 0.012 264)", label: "emerald-400 icon vs --card (dark)" },
  { icon: "oklch(0.74 0.14 85)",   bg: "oklch(0.14 0.012 264)", label: "amber-400 icon vs --card (dark)" },
  { icon: "oklch(0.68 0.20 25)",   bg: "oklch(0.14 0.012 264)", label: "rose-400 icon vs --card (dark)" },
  { icon: "oklch(0.68 0.14 200)",  bg: "oklch(0.14 0.012 264)", label: "cyan-400 icon vs --card (dark)" },
  // Sidebar inactive icons (post-fix: foreground/70)
  { icon: "oklch(0.12 0.02 264 / 0.70)",  bg: "oklch(0.985 0.006 264)", label: "sidebar inactive icon /70 on --sidebar (light)" },
  { icon: "oklch(0.96 0.006 264 / 0.70)", bg: "oklch(0.115 0.012 264)", label: "sidebar inactive icon /70 on --sidebar (dark)" },
  // CalendarDays icon (post-fix: muted-foreground)
  { icon: "oklch(0.45 0.03 264)",  bg: "oklch(0.99 0.003 264)", label: "calendar icon on --background (light)" },
  { icon: "oklch(0.70 0.015 264)", bg: "oklch(0.09 0.008 264)", label: "calendar icon on --background (dark)" },
  // Destructive icon vs card
  { icon: "oklch(0.52 0.245 27.325)", bg: "oklch(1 0.002 264)", label: "destructive icon vs --card (light)" },
  { icon: "oklch(0.68 0.22 25)",      bg: "oklch(0.14 0.012 264)", label: "destructive icon vs --card (dark)" },
];

describe("Design System — Property 5: Icon contrast ≥ 3:1", () => {
  it("for any icon/surface pair, contrast ratio ≥ 3:1", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: ICON_PAIRS.length - 1 }),
        (idx) => {
          const pair = ICON_PAIRS[idx]!;
          const ratio = computeContrastRatio(pair.icon, pair.bg);
          expect(ratio, `${pair.label}: ratio=${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(3.0);
          return ratio >= 3.0;
        },
      ),
      { numRuns: 100 },
    );
  });
});
