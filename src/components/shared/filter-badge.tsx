import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBadgeProps {
  filterType: "status" | "view";
  filterValue: string;
  onClear: () => void;
  className?: string;
}

/**
 * FilterBadge Component
 * 
 * Displays an active filter state with a clear button.
 * Used on Planner, Revisions, and Recovery pages to show which filter is active.
 * 
 * @param filterType - Type of filter: "status" (for task/revision status) or "view" (for recovery views)
 * @param filterValue - The current filter value (e.g., "completed", "pending", "missed", "plans")
 * @param onClear - Callback function to clear the filter
 * @param className - Optional additional CSS classes
 */
export function FilterBadge({ filterType, filterValue, onClear, className }: FilterBadgeProps) {
  // Capitalize first letter of filter value for display
  const capitalizedValue = filterValue.charAt(0).toUpperCase() + filterValue.slice(1);
  
  // Format label based on filter type
  const label = filterType === "status" 
    ? `Showing: ${capitalizedValue} tasks`
    : `View: ${capitalizedValue}`;

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span className="text-sm font-medium text-primary">
        {label}
      </span>
      <button
        type="button"
        onClick={onClear}
        className="text-primary hover:text-primary/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
        aria-label="Clear filter"
      >
        <X className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}
