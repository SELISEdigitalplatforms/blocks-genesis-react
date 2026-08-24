import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";

const h = vi.hoisted(() => ({
  handleClick: vi.fn(),
  isDisabled: false,
  isFetching: false,
}));
const navigate = vi.fn();

vi.mock("@/pages/console/use-project-overview-redirect", () => ({
  useProjectOverviewRedirect: () => ({
    handleClick: h.handleClick,
    isDisabled: h.isDisabled,
    isFetching: h.isFetching,
  }),
}));
vi.mock("react-router", async (imp) => ({
  ...(await imp<typeof import("react-router")>()),
  useNavigate: () => navigate,
}));

import { TooltipProvider } from "@/components/core/tooltip/tooltip";
import { ProjectCard } from "@/pages/console/project-card";
import { useProjectStore } from "@/store/project.store";

const project = {
  name: "My Project",
  tenantGroupId: "tg1",
  itemId: "i1",
  environment: "prod",
};
const envA = {
  name: "A",
  tenantGroupId: "tg1",
  itemId: "iA",
  environment: "prod",
  isShared: false,
};

const wrap = (ui: ReactNode) =>
  render(
    <MemoryRouter>
      <TooltipProvider>{ui}</TooltipProvider>
    </MemoryRouter>,
  );

beforeEach(() => {
  navigate.mockReset();
  h.handleClick.mockReset();
  h.isDisabled = false;
  h.isFetching = false;
  useProjectStore.getState().resetProjectStore();
});

describe("ProjectCard", () => {
  it("renders the project name and environment chips", () => {
    wrap(
      <ProjectCard
        project={project as never}
        projects={[envA] as never}
        isShared={false}
      />,
    );
    expect(screen.getByText("My Project")).toBeInTheDocument();
  });

  it("shows 'No environments' when there are none", () => {
    wrap(
      <ProjectCard project={project as never} projects={[]} isShared={false} />,
    );
    expect(screen.getByText("No environments")).toBeInTheDocument();
  });

  it("configures the project when the settings button is clicked", () => {
    wrap(
      <ProjectCard
        project={project as never}
        projects={[envA] as never}
        isShared={false}
      />,
    );
    fireEvent.click(screen.getAllByRole("button")[0]!);
    expect(h.handleClick).toHaveBeenCalled();
    expect(useProjectStore.getState().selectedTenantGroup).toBe("tg1");
  });

  it("navigates to an environment dashboard on chip click", () => {
    wrap(
      <ProjectCard
        project={project as never}
        projects={[envA] as never}
        isShared={false}
      />,
    );
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]!);
    expect(navigate).toHaveBeenCalledWith("/app/iA/dashboard");
  });

  it("shows an overflow popover for more than three environments", () => {
    const many = [
      envA,
      { ...envA, itemId: "i2", environment: "staging" },
      { ...envA, itemId: "i3", environment: "dev" },
      { ...envA, itemId: "i4", environment: "qa" },
    ];
    wrap(
      <ProjectCard
        project={project as never}
        projects={many as never}
        isShared={false}
      />,
    );
    expect(screen.getByText("+1 more")).toBeInTheDocument();
  });
});
