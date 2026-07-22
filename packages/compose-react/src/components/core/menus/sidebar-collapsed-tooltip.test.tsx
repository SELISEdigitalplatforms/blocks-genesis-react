import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TooltipProvider } from "@/components/core/tooltip";
import { SidebarCollapsedTooltip } from "@/components/core/menus/sidebar-collapsed-tooltip";

describe("SidebarCollapsedTooltip", () => {
  it("renders its children directly when show is false", () => {
    render(
      <SidebarCollapsedTooltip label="Tip" show={false}>
        <span>Child</span>
      </SidebarCollapsedTooltip>,
    );
    expect(screen.getByText("Child")).toBeInTheDocument();
  });

  it("wraps its children in a tooltip trigger when show is true", () => {
    render(
      <TooltipProvider>
        <SidebarCollapsedTooltip label="Tip" show>
          <span>Child</span>
        </SidebarCollapsedTooltip>
      </TooltipProvider>,
    );
    expect(screen.getByText("Child")).toBeInTheDocument();
  });
});
