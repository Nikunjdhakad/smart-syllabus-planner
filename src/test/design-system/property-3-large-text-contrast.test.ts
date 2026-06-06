/**
 * Feature: design-system-overhaul
 * Property 3: Large text WCAG AA Large contrast (≥ 3:1)
 * Validates: Requirements 3.2
 * Large text = font-size ≥ 18px regular OR ≥ 14px bold
 */
import fc from "fast-check";
import { describe, it, expect } from "vitest";
import { computeContrastRatio } from "../colour-utils";

// Heading tokens and primary-coloured headings on background/card surfaces
const LARGE_TEXT_PAIRS_LIGHT = [
  { fg: "oklch(0.12 0.02 264)",  bg: "oklch(0.99 0.003 264)", label: "--foreground heading on --background" },
  { fg: "oklch(0.12 0.02 264)",  bg: "oklch(1 0.002 264)",    label: "--foreground heading on --card" },
  { fg: "oklch(0.52 0.22 270)",  bg: "oklch(1 0.002 264)",    label: "--primary heading on --card" },
  { fg: "oklch(0.52 0.22 270)",  bg: "oklch(0.99 0.003 264)", label: "--primary heading on --background" },
];

const LARGE_TEXT_PAIRS_DARK = [
  { fg: "oklch(0.96 0.006 264)", bg: "oklch(0.09 0.008 264)", label: "--foreground heading on --background (dark)" },
  { fg: "oklch(0.96 0.006 264)", bg: "oklch(0.14 0.012 264)", label: "--foreground heading on --card (dark)" },
  { fg: "oklch(0.68 0.22 270)",  bg: "oklch(0.14 0.012 264)", label: "--primary heading on --card (dark)" },
  { fg: "oklch(0.68 0.22 270)",  bg: "oklch(0.09 0.008 264)", label: "--primary heading on --background (dark)" },
];

describe("Design System — Property 3: Large text contrast ≥ 3:1", () => {
  it("all light-mode large-text pairs meet WCAG AA Large (3:1)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: LARGE_TEXT_PAIRS_LIGHT.length - 1 }),
        (idx) => {
          const pair = LARGE_TEXT_PAIRS_LIGHT[idx]!;
          const ratio = computeContrastRatio(pair.fg, pair.bg);
          expect(ratio, `${pair.label}: ratio=${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(3.0);
          return ratio >= 3.0;
        },
      ),
      { numRuns: 100 },
    );
  });

  it("all dark-mode large-text pairs meet WCAG AA Large (3:1)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: LARGE_TEXT_PAIRS_DARK.length - 1 }),
        (idx) => {
          const pair = LARGE_TEXT_PAIRS_DARK[idx]!;
          const ratio = computeContrastRatio(pair.fg, pair.bg);
          expect(ratio, `${pair.label}: ratio=${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(3.0);
          return ratio >= 3.0;
        },
      ),
      { numRuns: 100 },
    );
  });
});
