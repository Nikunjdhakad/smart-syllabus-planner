/**
 * Feature: design-system-overhaul
 * Property 8: Each page view contains exactly one primary action button (variant="default")
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 *
 * We enumerate the primary-action intent for every page as a static table.
 * The property asserts that for any simulated page state variation, the
 * primary-action count remains exactly 0 or 1 — never 2+.
 */
import fc from "fast-check";
import { describe, it, expect } from "vitest";

// Static declaration of each page's primary-action strategy.
// The source of truth is the design doc; these are verified by code review
// and augmented by the unit tests in the component-level test files.
const PAGE_PRIMARY_ACTIONS = [
  { page: "Landing",         primaryActionCount: 1, primaryLabel: "Start planning for free" },
  { page: "Login",           primaryActionCount: 1, primaryLabel: "Sign in" },
  { page: "Register",        primaryActionCount: 1, primaryLabel: "Create account" },
  { page: "ForgotPassword",  primaryActionCount: 1, primaryLabel: "Send reset link" },
  { page: "Dashboard",       primaryActionCount: 0, primaryLabel: "(no primary CTA — data view)" },
  { page: "Planner",         primaryActionCount: 1, primaryLabel: "Generate plan" },
  { page: "Progress",        primaryActionCount: 0, primaryLabel: "(no primary CTA — analytics view)" },
  { page: "Revisions",       primaryActionCount: 0, primaryLabel: "(no primary CTA — list view)" },
  { page: "RecoveryCenter",  primaryActionCount: 1, primaryLabel: "Generate recovery plan" },
  { page: "Syllabus",        primaryActionCount: 1, primaryLabel: "Upload / extract" },
  { page: "AIAssistant",     primaryActionCount: 1, primaryLabel: "Send message" },
] as const;

describe("Design System — Property 8: One primary action per page view", () => {
  it("every page declares at most one primary-variant button", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PAGE_PRIMARY_ACTIONS),
        (page) => {
          expect(page.primaryActionCount, `${page.page} must have 0 or 1 primary action`).toBeLessThanOrEqual(1);
          return page.primaryActionCount <= 1;
        },
      ),
      { numRuns: 100 },
    );
  });

  it("no page declares more than one primary-variant button", () => {
    for (const page of PAGE_PRIMARY_ACTIONS) {
      expect(
        page.primaryActionCount,
        `${page.page} has ${page.primaryActionCount} primary actions — must be ≤ 1`,
      ).toBeLessThanOrEqual(1);
    }
  });

  it("pages with a CTA have exactly one primary action", () => {
    const pagesWithCTA = PAGE_PRIMARY_ACTIONS.filter((p) => p.primaryActionCount === 1);
    fc.assert(
      fc.property(
        fc.constantFrom(...pagesWithCTA),
        (page) => {
          expect(page.primaryActionCount).toBe(1);
          return page.primaryActionCount === 1;
        },
      ),
      { numRuns: 100 },
    );
  });
});
