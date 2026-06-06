/**
 * Feature: design-system-overhaul
 * Property 2: Normal text WCAG AA contrast (≥ 4.5:1)
 * Validates: Requirements 3.1, 3.3
 */
import fc from "fast-check";
import { describe, it, expect } from "vitest";
import { computeContrastRatio } from "../colour-utils";

// Colour values taken directly from the CSS custom properties in globals.css

const COLOR_PAIRS_LIGHT = [
  { fg: "oklch(0.12 0.02 264)",   bg: "oklch(0.99 0.003 264)",  label: "--foreground on --background" },
  { fg: "oklch(0.12 0.02 264)",   bg: "oklch(1 0.002 264)",     label: "--card-foreground on --card" },
  { fg: "oklch(0.45 0.03 264)",   bg: "oklch(0.99 0.003 264)",  label: "--muted-foreground on --background" },
  { fg: "oklch(0.45 0.03 264)",   bg: "oklch(1 0.002 264)",     label: "--muted-foreground on --card" },
  { fg: "oklch(0.18 0.03 264)",   bg: "oklch(0.985 0.006 264)", label: "--sidebar-foreground on --sidebar" },
];

const COLOR_PAIRS_DARK = [
  { fg: "oklch(0.96 0.006 264)",  bg: "oklch(0.09 0.008 264)",  label: "--foreground on --background (dark)" },
  { fg: "oklch(0.96 0.006 264)",  bg: "oklch(0.14 0.012 264)",  label: "--card-foreground on --card (dark)" },
  { fg: "oklch(0.70 0.015 264)",  bg: "oklch(0.09 0.008 264)",  label: "--muted-foreground on --background (dark)" },
  { fg: "oklch(0.70 0.015 264)",  bg: "oklch(0.14 0.012 264)",  label: "--muted-foreground on --card (dark)" },
  { fg: "oklch(0.94 0.006 264)",  bg: "oklch(0.115 0.012 264)", label: "--sidebar-foreground on --sidebar (dark)" },
];

describe("Design System — Property 2: Normal text contrast ≥ 4.5:1", () => {
  it("all light-mode foreground/background pairs meet WCAG AA (4.5:1)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: COLOR_PAIRS_LIGHT.length - 1 }),
        (idx) => {
          const pair = COLOR_PAIRS_LIGHT[idx]!;
          const ratio = computeContrastRatio(pair.fg, pair.bg);
          expect(ratio, `${pair.label}: ratio=${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
          return ratio >= 4.5;
        },
      ),
      { numRuns: 100 },
    );
  });

  it("all dark-mode foreground/background pairs meet WCAG AA (4.5:1)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: COLOR_PAIRS_DARK.length - 1 }),
        (idx) => {
          const pair = COLOR_PAIRS_DARK[idx]!;
          const ratio = computeContrastRatio(pair.fg, pair.bg);
          expect(ratio, `${pair.label}: ratio=${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
          return ratio >= 4.5;
        },
      ),
      { numRuns: 100 },
    );
  });
});
