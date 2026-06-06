"use client";

import { CopilotFab } from "@/components/copilot/copilot-fab";
import { CopilotDrawer } from "@/components/copilot/copilot-drawer";

/**
 * Drop this anywhere in the layout tree (inside CopilotProvider).
 * Renders the fixed FAB + the slide-out drawer panel.
 */
export function FloatingCopilot() {
  return (
    <>
      <CopilotDrawer />
      <CopilotFab />
    </>
  );
}
