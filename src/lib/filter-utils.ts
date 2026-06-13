import type { PlannerTask } from "@/types/study-plan";
import type { RevisionItem } from "@/types/revision";

// Valid filter values per page
export const PLANNER_FILTERS = ["completed", "pending", "overdue", "missed"] as const;
export const REVISION_FILTERS = ["upcoming", "completed", "missed"] as const;
export const RECOVERY_VIEWS = ["missed", "plans", "recovered"] as const;

export type PlannerFilter = (typeof PLANNER_FILTERS)[number];
export type RevisionFilter = (typeof REVISION_FILTERS)[number];
export type RecoveryView = (typeof RECOVERY_VIEWS)[number];

/**
 * Validate and parse planner status filter from URL
 * Returns null if invalid or not present
 */
export function getPlannerFilter(searchParams: URLSearchParams): PlannerFilter | null {
  const status = searchParams.get("status");
  if (!status) return null;
  return PLANNER_FILTERS.includes(status as PlannerFilter) ? (status as PlannerFilter) : null;
}

/**
 * Validate and parse revisions status filter from URL
 * Returns null if invalid or not present
 */
export function getRevisionFilter(searchParams: URLSearchParams): RevisionFilter | null {
  const status = searchParams.get("status");
  if (!status) return null;
  return REVISION_FILTERS.includes(status as RevisionFilter) ? (status as RevisionFilter) : null;
}

/**
 * Validate and parse recovery view filter from URL
 * Returns null if invalid or not present
 */
export function getRecoveryView(searchParams: URLSearchParams): RecoveryView | null {
  const view = searchParams.get("view");
  if (!view) return null;
  return RECOVERY_VIEWS.includes(view as RecoveryView) ? (view as RecoveryView) : null;
}

/**
 * Filter tasks by status
 * Returns all tasks if filter is null
 * For "pending" filter: includes both "pending" and "in_progress" tasks
 * For "overdue"/"missed" filter: treats them as equivalent
 */
export function filterTasksByStatus(
  tasks: PlannerTask[],
  filter: PlannerFilter | null
): PlannerTask[] {
  if (!filter) return tasks;

  switch (filter) {
    case "completed":
      return tasks.filter((task) => task.status === "completed");
    
    case "pending":
      // "pending" includes both "pending" and "in_progress"
      return tasks.filter((task) => task.status === "pending" || task.status === "in_progress");
    
    case "overdue":
    case "missed":
      // "overdue" and "missed" are equivalent
      return tasks.filter((task) => task.status === "missed");
    
    default:
      return tasks;
  }
}

/**
 * Filter revisions by status
 * Returns all revisions if filter is null
 * For "upcoming": scheduled revisions with future due dates
 * For "missed": scheduled revisions with past due dates OR skipped revisions
 */
export function filterRevisionsByStatus(
  revisions: RevisionItem[],
  filter: RevisionFilter | null
): RevisionItem[] {
  if (!filter) return revisions;

  const now = new Date();

  switch (filter) {
    case "completed":
      return revisions.filter((revision) => revision.status === "completed");
    
    case "upcoming":
      // Upcoming: scheduled revisions with future due dates
      return revisions.filter((revision) => {
        if (revision.status !== "scheduled") return false;
        const dueDate = new Date(revision.dueDate);
        return dueDate >= now;
      });
    
    case "missed":
      // Missed: scheduled revisions with past due dates OR skipped revisions
      return revisions.filter((revision) => {
        if (revision.status === "skipped") return true;
        if (revision.status === "scheduled") {
          const dueDate = new Date(revision.dueDate);
          return dueDate < now;
        }
        return false;
      });
    
    default:
      return revisions;
  }
}
