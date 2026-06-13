/**
 * FilterBadge Component Examples
 * 
 * This file demonstrates the FilterBadge component in various states.
 * These examples can be used for visual testing and documentation.
 */

import { FilterBadge } from "./filter-badge";

export function FilterBadgeExamples() {
  return (
    <div className="space-y-6 p-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">Status Filters</h2>
        <div className="space-y-3">
          <FilterBadge
            filterType="status"
            filterValue="completed"
            onClear={() => console.log("Clear completed filter")}
          />
          <FilterBadge
            filterType="status"
            filterValue="pending"
            onClear={() => console.log("Clear pending filter")}
          />
          <FilterBadge
            filterType="status"
            filterValue="missed"
            onClear={() => console.log("Clear missed filter")}
          />
          <FilterBadge
            filterType="status"
            filterValue="overdue"
            onClear={() => console.log("Clear overdue filter")}
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">View Filters</h2>
        <div className="space-y-3">
          <FilterBadge
            filterType="view"
            filterValue="missed"
            onClear={() => console.log("Clear missed view")}
          />
          <FilterBadge
            filterType="view"
            filterValue="plans"
            onClear={() => console.log("Clear plans view")}
          />
          <FilterBadge
            filterType="view"
            filterValue="recovered"
            onClear={() => console.log("Clear recovered view")}
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">With Custom Classes</h2>
        <FilterBadge
          filterType="status"
          filterValue="completed"
          onClear={() => console.log("Clear filter")}
          className="shadow-md"
        />
      </div>
    </div>
  );
}

export default FilterBadgeExamples;
