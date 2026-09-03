import { TooltipProvider } from "@/components/core/tooltip/tooltip";
import type { IProject, IProjectGroup } from "@/models";
import { useProjectStore } from "@/store/project.store";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectList } from "./project-list";

const h = vi.hoisted(() => ({
  createClick: vi.fn(),
  isMobile: false,
  navigate: vi.fn(),
  overviewClick: vi.fn(),
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => h.isMobile,
}));
vi.mock("./use-project-overview-redirect", () => ({
  useProjectOverviewRedirect: () => ({
    handleClick: h.overviewClick,
    isDisabled: false,
    isFetching: false,
  }),
}));
vi.mock("./use-create-project-redirect", () => ({
  useCreateProjectRedirect: () => ({
    handleClick: h.createClick,
    isDisabled: false,
    isFetching: false,
  }),
}));
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => h.navigate,
}));

const project = (
  groupId: string,
  name: string,
  environment: string,
  updated: string,
): IProject =>
  ({
    environment,
    itemId: `${groupId}-${environment}`,
    lastUpdatedDate: updated,
    name,
    tenantGroupId: groupId,
    tenantId: `${groupId}-${environment}`,
  }) as IProject;

const group = ({
  accessPolicies,
  environments = ["dev"],
  id,
  isShared = false,
  name,
  updated = "2026-09-01T00:00:00.000Z",
}: {
  accessPolicies?: string[];
  environments?: string[];
  id: string;
  isShared?: boolean;
  name: string;
  updated?: string;
}): IProjectGroup => ({
  accessPolicies,
  isShared,
  nonSharedProject: [],
  projects: environments.map((environment) =>
    project(id, name, environment, updated),
  ),
  tenantGroupId: id,
});

const wrap = (ui: ReactNode) =>
  render(
    <MemoryRouter>
      <TooltipProvider>{ui}</TooltipProvider>
    </MemoryRouter>,
  );

const baseProps = {
  projectGroups: [
    group({ id: "alpha", name: "Alpha", updated: "2026-09-01T00:00:00.000Z" }),
    group({ id: "beta", name: "Beta", updated: "2026-09-02T00:00:00.000Z" }),
  ],
  showAddProject: true,
};

beforeEach(() => {
  h.createClick.mockReset();
  h.navigate.mockReset();
  h.overviewClick.mockReset();
  h.isMobile = false;
  useProjectStore.getState().resetProjectStore();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-03T00:00:00.000Z"));
});

afterEach(() => vi.useRealTimers());

describe("ProjectList", () => {
  it("renders the desktop rows, relative updates, and add action with no column headers", () => {
    wrap(<ProjectList {...baseProps} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryAllByRole("columnheader")).toHaveLength(0);
    expect(screen.getAllByTestId("project-list-row")).toHaveLength(2);
    expect(screen.getByText("Updated 2 days ago")).toBeInTheDocument();
    expect(screen.getByTestId("add-project-list-row")).toBeInTheDocument();
  });

  it("matches the grid overflow behavior after three environments", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const manyEnvironments = group({
      environments: ["dev", "test", "stg", "iat"],
      id: "many",
      name: "Many Environments",
    });
    wrap(
      <ProjectList
        {...baseProps}
        projectGroups={[manyEnvironments]}
        showAddProject={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "+1 more" }));

    expect(screen.getByText("All environments")).toBeInTheDocument();
    expect(screen.getAllByText("Development")).toHaveLength(2);
    expect(screen.getByText("IAT")).toBeInTheDocument();
  });

  it("disables grantless shared access and enables granted shared access", () => {
    wrap(
      <ProjectList
        {...baseProps}
        showAddProject={false}
        projectGroups={[
          group({
            accessPolicies: [],
            id: "denied",
            isShared: true,
            name: "Denied",
          }),
          group({
            accessPolicies: ["people::view"],
            id: "granted",
            isShared: true,
            name: "Granted",
          }),
        ]}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Project access unavailable" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Open shared project" }),
    ).toBeEnabled();
  });

  it("uses stacked compact cards below the mobile breakpoint", () => {
    h.isMobile = true;
    wrap(<ProjectList {...baseProps} />);

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByTestId("project-list-mobile")).toBeInTheDocument();
    expect(screen.getAllByTestId("project-list-row")).toHaveLength(2);
    expect(screen.getByTestId("add-project-list-row")).toBeInTheDocument();
  });
});
