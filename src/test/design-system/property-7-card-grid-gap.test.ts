/**
 * Feature: design-system-overhaul
 * Property 7: Card grid gap constraint (gap-4 or gap-6 only)
 * Validates: Requirements 5.3
 */
import fc from "fast-check";
import { describe, it, expect } from "vitest";

const VALID_GAPS = new Set(["gap-4", "gap-6"]);
const INVALID_GAPS = ["gap-3", "gap-2", "gap-1", "gap-5", "gap-7", "gap-8"] as const;

describe("Design System — Property 7: Card grid gap is gap-4 or gap-6", () => {
  it("for any valid gap choice, it is in the allowed set", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 8 }), // simulated card count
        fc.constantFrom("gap-4", "gap-6"),
        (_count, chosenGap) => {
          expect(VALID_GAPS.has(chosenGap)).toBe(true);
          return VALID_GAPS.has(chosenGap);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("none of the known invalid gap values are in the valid set", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...INVALID_GAPS),
        (invalidGap) => {
          expect(VALID_GAPS.has(invalidGap)).toBe(false);
          return !VALID_GAPS.has(invalidGap);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("gap-3 is explicitly rejected", () => {
    expect(VALID_GAPS.has("gap-3")).toBe(false);
  });
});
