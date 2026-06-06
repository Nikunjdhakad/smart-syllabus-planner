/**
 * Feature: design-system-overhaul
 * Property 6: Sole-indicator icons meet elevated contrast threshold (≥ 4.5:1)
 * Validates: Requirements 4.6
 * Sole-indicator = icon with no adjacent text label (e.g. sidebar nav icons
 * in mobile-collapsed state, or status-only icons).
 */
import fc from "fast-check";
import { describe, it, expect } from "vitest";
import { computeContrastRatio } from "../colour-utils";

// Icons that serve as the sole visual indicator of an action or status.
// These must clear 4.5:1 rather than 3:1.
const SOLE_INDICATOR_PAIRS = [
  // Active sidebar nav icon (primary colour) on --sidebar (light)
  { icon: "oklch(0.52 0.22 270)", bg: "oklch(0.985 0.006 264)", label: "active sidebar nav icon on --sidebar (light)" },
  // Active sidebar nav icon (primary colour) on --sidebar (dark)
  { icon: "oklch(0.68 0.22 270)", bg: "oklch(0.115 0.012 264)", label: "active sidebar nav icon on --sidebar (dark)" },
  // Inactive sidebar nav icon (foreground/70) on --sidebar (light) — post-fix
  { icon: "oklch(0.12 0.02 264 / 0.70)", bg: "oklch(0.985 0.006 264)", label: "inactive sidebar nav icon /70 on --sidebar (light)" },
  // Inactive sidebar nav icon (foreground/70) on --sidebar (dark) — post-fix
  { icon: "oklch(0.96 0.006 264 / 0.70)", bg: "oklch(0.115 0.012 264)", label: "inactive sidebar nav icon /70 on --sidebar (dark)" },
];

describe("Design System — Property 6: Sole-indicator icon contrast ≥ 4.5:1", () => {
  it("for any sole-indicator icon/container pair, contrast ratio ≥ 4.5:1", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SOLE_INDICATOR_PAIRS),
        (pair) => {
          const ratio = computeContrastRatio(pair.icon, pair.bg);
          expect(ratio, `${pair.label}: ratio=${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
          return ratio >= 4.5;
        },
      ),
      { numRuns: 100 },
    );
  });
});
