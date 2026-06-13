/**
 * Unit tests for FilterBadge component
 * 
 * Tests Requirements:
 * - 20.1: Display filter badge when filter is active
 * - 20.2: Display correct label for status filters
 * - 20.3: Display correct label for view filters
 * - 20.4: Include clear button
 * - 20.5: Badge positioned near filtered list
 * - 21.1: Clear button visible
 * - 21.2: Clear button calls onClear callback
 * - 23.1: Keyboard focusable
 * - 23.2: Keyboard activation with Enter/Space
 * - 24.3: Appropriate ARIA labels
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBadge } from "./filter-badge";

describe("FilterBadge Component", () => {
  describe("Rendering", () => {
    it("renders with status filter type and value", () => {
      render(
        <FilterBadge
          filterType="status"
          filterValue="completed"
          onClear={() => {}}
        />
      );

      expect(screen.getByText("Showing: Completed tasks")).toBeInTheDocument();
    });

    it("renders with view filter type and value", () => {
      render(
        <FilterBadge
          filterType="view"
          filterValue="missed"
          onClear={() => {}}
        />
      );

      expect(screen.getByText("View: Missed")).toBeInTheDocument();
    });

    it("capitalizes the first letter of filter value", () => {
      render(
        <FilterBadge
          filterType="status"
          filterValue="pending"
          onClear={() => {}}
        />
      );

      expect(screen.getByText("Showing: Pending tasks")).toBeInTheDocument();
    });

    it("renders clear button with X icon", () => {
      render(
        <FilterBadge
          filterType="status"
          filterValue="completed"
          onClear={() => {}}
        />
      );

      const clearButton = screen.getByRole("button", { name: "Clear filter" });
      expect(clearButton).toBeInTheDocument();
    });

    it("applies custom className when provided", () => {
      const { container } = render(
        <FilterBadge
          filterType="status"
          filterValue="completed"
          onClear={() => {}}
          className="custom-class"
        />
      );

      const badge = container.querySelector(".custom-class");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has role='status' for live region announcement", () => {
      const { container } = render(
        <FilterBadge
          filterType="status"
          filterValue="completed"
          onClear={() => {}}
        />
      );

      const statusElement = container.querySelector('[role="status"]');
      expect(statusElement).toBeInTheDocument();
    });

    it("has aria-live='polite' for screen reader updates", () => {
      const { container } = render(
        <FilterBadge
          filterType="status"
          filterValue="completed"
          onClear={() => {}}
        />
      );

      const liveElement = container.querySelector('[aria-live="polite"]');
      expect(liveElement).toBeInTheDocument();
    });

    it("clear button has aria-label", () => {
      render(
        <FilterBadge
          filterType="status"
          filterValue="completed"
          onClear={() => {}}
        />
      );

      const clearButton = screen.getByRole("button", { name: "Clear filter" });
      expect(clearButton).toHaveAttribute("aria-label", "Clear filter");
    });

    it("clear button is keyboard focusable", () => {
      render(
        <FilterBadge
          filterType="status"
          filterValue="completed"
          onClear={() => {}}
        />
      );

      const clearButton = screen.getByRole("button", { name: "Clear filter" });
      expect(clearButton).toHaveAttribute("type", "button");
    });
  });

  describe("Interaction", () => {
    it("calls onClear when clear button is clicked", async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();

      render(
        <FilterBadge
          filterType="status"
          filterValue="completed"
          onClear={onClear}
        />
      );

      const clearButton = screen.getByRole("button", { name: "Clear filter" });
      await user.click(clearButton);

      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it("calls onClear when Enter key is pressed on clear button", async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();

      render(
        <FilterBadge
          filterType="status"
          filterValue="completed"
          onClear={onClear}
        />
      );

      const clearButton = screen.getByRole("button", { name: "Clear filter" });
      clearButton.focus();
      await user.keyboard("{Enter}");

      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it("calls onClear when Space key is pressed on clear button", async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();

      render(
        <FilterBadge
          filterType="status"
          filterValue="completed"
          onClear={onClear}
        />
      );

      const clearButton = screen.getByRole("button", { name: "Clear filter" });
      clearButton.focus();
      await user.keyboard(" ");

      expect(onClear).toHaveBeenCalledTimes(1);
    });
  });

  describe("Label Formatting", () => {
    it("formats status filter label correctly for completed", () => {
      render(
        <FilterBadge
          filterType="status"
          filterValue="completed"
          onClear={() => {}}
        />
      );

      expect(screen.getByText("Showing: Completed tasks")).toBeInTheDocument();
    });

    it("formats status filter label correctly for pending", () => {
      render(
        <FilterBadge
          filterType="status"
          filterValue="pending"
          onClear={() => {}}
        />
      );

      expect(screen.getByText("Showing: Pending tasks")).toBeInTheDocument();
    });

    it("formats status filter label correctly for missed", () => {
      render(
        <FilterBadge
          filterType="status"
          filterValue="missed"
          onClear={() => {}}
        />
      );

      expect(screen.getByText("Showing: Missed tasks")).toBeInTheDocument();
    });

    it("formats view filter label correctly for missed", () => {
      render(
        <FilterBadge
          filterType="view"
          filterValue="missed"
          onClear={() => {}}
        />
      );

      expect(screen.getByText("View: Missed")).toBeInTheDocument();
    });

    it("formats view filter label correctly for plans", () => {
      render(
        <FilterBadge
          filterType="view"
          filterValue="plans"
          onClear={() => {}}
        />
      );

      expect(screen.getByText("View: Plans")).toBeInTheDocument();
    });

    it("formats view filter label correctly for recovered", () => {
      render(
        <FilterBadge
          filterType="view"
          filterValue="recovered"
          onClear={() => {}}
        />
      );

      expect(screen.getByText("View: Recovered")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies design system classes", () => {
      const { container } = render(
        <FilterBadge
          filterType="status"
          filterValue="completed"
          onClear={() => {}}
        />
      );

      const badge = container.querySelector(".border-primary\\/30");
      expect(badge).toBeInTheDocument();
    });

    it("has hover transition on clear button", () => {
      render(
        <FilterBadge
          filterType="status"
          filterValue="completed"
          onClear={() => {}}
        />
      );

      const clearButton = screen.getByRole("button", { name: "Clear filter" });
      expect(clearButton).toHaveClass("transition-colors");
    });
  });
});
