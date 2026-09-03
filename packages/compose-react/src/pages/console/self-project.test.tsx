import type { IProjectGroup } from "@/models";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SelfProject } from "./self-project";

const h = vi.hoisted(() => ({ getProjects: vi.fn() }));

vi.mock("@/hooks/use-project", () => ({
  useGetProjects: () => h.getProjects(),
}));
vi.mock("@/components/common/project", () => ({
  ProjectCardLoadingSkeleton: () => <div data-testid="skeleton" />,
  ProjectListRowLoadingSkeleton: () => <div data-testid="list-skeleton" />,
}));
vi.mock("@/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/hooks")>()),
  useIsMobile: () => false,
  usePopoverWidth: () => [{ current: null }, undefined],
}));
vi.mock("./project-card", () => ({
  ProjectCard: ({
    project,
    canOpen,
  }: {
    project: { name: string };
    canOpen?: boolean;
  }) => (
    <div data-testid="project-card" data-can-open={String(canOpen)}>
      {project.name}
    </div>
  ),
}));
vi.mock("./add-project-card", () => ({
  AddProjectCard: () => <div data-testid="add-card" />,
}));
vi.mock("./project-list", () => ({
  ProjectList: ({
    projectGroups,
    showAddProject,
  }: {
    projectGroups: IProjectGroup[];
    showAddProject: boolean;
  }) => (
    <div data-testid="project-list">
      {showAddProject && <div data-testid="add-project-list-row" />}
      {projectGroups.map((projectGroup) => (
        <div key={projectGroup.tenantGroupId} data-testid="list-project">
          {projectGroup.projects[0]?.name}
        </div>
      ))}
    </div>
  ),
}));
vi.mock("./console-create", () => ({
  default: () => <div data-testid="console-create" />,
}));

const group = (
  id: string,
  name: string,
  environment = "dev",
  lastUpdatedDate = "2026-09-01T00:00:00.000Z",
) => ({
  tenantGroupId: id,
  projects: [
    {
      environment,
      itemId: `${id}-${environment}`,
      lastUpdatedDate,
      name,
      tenantGroupId: id,
      tenantId: id,
    },
  ],
  nonSharedProject: [],
  isShared: false,
});

const sharedGroup = (id: string, name: string, accessPolicies?: string[]) => ({
  ...group(id, name),
  isShared: true,
  accessPolicies,
});

describe("SelfProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("shows the grid loading skeletons while fetching in grid view, keeping static chrome visible", () => {
    h.getProjects.mockReturnValue({ isLoading: true, isFetching: true });

    render(<SelfProject />);

    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
    expect(screen.queryByTestId("list-skeleton")).not.toBeInTheDocument();
    expect(screen.getByText("Your Blocks Projects")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search projects..."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Grid view" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("project-card")).not.toBeInTheDocument();
  });

  it("shows the list loading skeletons while fetching in list view", () => {
    localStorage.setItem(
      "console:projectsViewMode",
      JSON.stringify({ value: "list" }),
    );
    h.getProjects.mockReturnValue({ isLoading: true, isFetching: true });

    render(<SelfProject />);

    expect(screen.getAllByTestId("list-skeleton").length).toBeGreaterThan(0);
    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
    expect(screen.getByText("Your Blocks Projects")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search projects..."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "List view" }),
    ).toBeInTheDocument();
  });

  it("renders the create-project flow when empty and creation is allowed", () => {
    h.getProjects.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
    });

    render(<SelfProject canCreateProject />);

    expect(screen.getByTestId("console-create")).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Search projects..."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("radio", { name: "List view" }),
    ).not.toBeInTheDocument();
  });

  it("defaults to the grid with the toolbar and add card", () => {
    h.getProjects.mockReturnValue({
      data: [group("g1", "Alpha"), group("g2", "Beta")],
      isLoading: false,
      isFetching: false,
    });

    render(<SelfProject canCreateProject />);

    expect(screen.getByText("Your Blocks Projects")).toBeInTheDocument();
    expect(screen.getAllByTestId("project-card")).toHaveLength(2);
    expect(screen.getByTestId("add-card")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search projects..."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Environment/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Grid view" })).toHaveAttribute(
      "data-state",
      "on",
    );
  });

  it("searches the same project set in grid and list and hides the add action", async () => {
    h.getProjects.mockReturnValue({
      data: [group("g1", "Alpha Portal"), group("g2", "Beta Service")],
      isLoading: false,
      isFetching: false,
    });

    render(<SelfProject canCreateProject />);
    fireEvent.change(screen.getByPlaceholderText("Search projects..."), {
      target: { value: "Alpha" },
    });

    await waitFor(() =>
      expect(screen.getAllByTestId("project-card")).toHaveLength(1),
    );
    expect(screen.getByText("Alpha Portal")).toBeInTheDocument();
    expect(screen.queryByText("Beta Service")).not.toBeInTheDocument();
    expect(screen.queryByTestId("add-card")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "List view" }));
    expect(screen.getAllByTestId("list-project")).toHaveLength(1);
    expect(screen.getByText("Alpha Portal")).toBeInTheDocument();
    expect(
      screen.queryByTestId("add-project-list-row"),
    ).not.toBeInTheDocument();
  });

  it("filters both views when any sibling has a selected environment", async () => {
    const user = userEvent.setup();
    const alpha = group("g1", "Alpha Portal");
    alpha.projects.push({
      ...alpha.projects[0]!,
      environment: "prod",
      itemId: "g1-prod",
    });
    h.getProjects.mockReturnValue({
      data: [alpha, group("g2", "Beta Service", "test")],
      isLoading: false,
      isFetching: false,
    });

    render(<SelfProject canCreateProject />);
    await user.click(screen.getByRole("button", { name: /Environment/ }));
    await user.click(await screen.findByText("Production"));

    expect(screen.getAllByTestId("project-card")).toHaveLength(1);
    expect(screen.getByText("Alpha Portal")).toBeInTheDocument();
    expect(screen.getByTestId("add-card")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "List view" }));
    expect(screen.getAllByTestId("list-project")).toHaveLength(1);
    expect(screen.getByText("Alpha Portal")).toBeInTheDocument();
    expect(screen.getByTestId("add-project-list-row")).toBeInTheDocument();
  });

  it("shows and clears the no-match state in either view", async () => {
    h.getProjects.mockReturnValue({
      data: [group("g1", "Alpha"), group("g2", "Beta")],
      isLoading: false,
      isFetching: false,
    });

    render(<SelfProject canCreateProject />);
    fireEvent.change(screen.getByPlaceholderText("Search projects..."), {
      target: { value: "zzzznotarealproject" },
    });

    await screen.findByText("No projects match your search");
    expect(screen.queryByTestId("add-card")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "List view" }));
    expect(
      screen.getByText("No projects match your search"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("add-project-list-row"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(screen.getAllByTestId("list-project")).toHaveLength(2);
    expect(screen.getByTestId("add-project-list-row")).toBeInTheDocument();
  });

  it("persists list view while keeping search and filters session-only", async () => {
    const user = userEvent.setup();
    h.getProjects.mockReturnValue({
      data: [group("g1", "Alpha"), group("g2", "Beta", "test")],
      isLoading: false,
      isFetching: false,
    });

    const first = render(<SelfProject canCreateProject />);
    await user.click(screen.getByRole("radio", { name: "List view" }));
    await user.click(screen.getByRole("button", { name: /Environment/ }));
    await user.click(await screen.findByText("Development"));
    expect(screen.getAllByTestId("list-project")).toHaveLength(1);
    first.unmount();

    render(<SelfProject canCreateProject />);
    expect(screen.getByTestId("project-list")).toBeInTheDocument();
    expect(screen.getAllByTestId("list-project")).toHaveLength(2);
    expect(screen.getByTestId("add-project-list-row")).toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem("console:projectsViewMode") || ""),
    ).toMatchObject({ value: "list" });
  });

  it("orders both views by most recently updated by default", () => {
    localStorage.setItem(
      "console:projectsViewMode",
      JSON.stringify({ value: "list" }),
    );
    h.getProjects.mockReturnValue({
      data: [
        group("g1", "Alpha", "dev", "2026-08-01T00:00:00.000Z"),
        group("g2", "Beta", "test", "2026-09-01T00:00:00.000Z"),
      ],
      isLoading: false,
      isFetching: false,
    });

    render(<SelfProject canCreateProject />);
    expect(
      screen.getAllByTestId("list-project").map((row) => row.textContent),
    ).toEqual(["Beta", "Alpha"]);

    fireEvent.click(screen.getByRole("radio", { name: "Grid view" }));
    expect(
      screen.getAllByTestId("project-card").map((card) => card.textContent),
    ).toEqual(["Beta", "Alpha"]);
  });

  it("hides the add card and warns when at the project limit", () => {
    const groups = Array.from({ length: 10 }, (_v, i) =>
      group(`g${i}`, `P${i}`),
    );
    h.getProjects.mockReturnValue({
      data: groups,
      isLoading: false,
      isFetching: false,
    });

    render(<SelfProject canCreateProject />);

    expect(screen.queryByTestId("add-card")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Please delete an existing project to create a new one.",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the ten-group limit under filtering and in list view", async () => {
    const user = userEvent.setup();
    const groups = Array.from({ length: 10 }, (_value, index) =>
      group(`g${index}`, `P${index}`, index < 3 ? "dev" : "test"),
    );
    h.getProjects.mockReturnValue({
      data: groups,
      isLoading: false,
      isFetching: false,
    });

    render(<SelfProject canCreateProject />);
    await user.click(screen.getByRole("button", { name: /Environment/ }));
    await user.click(await screen.findByText("Development"));
    await user.click(screen.getByRole("radio", { name: "List view" }));

    expect(screen.getAllByTestId("list-project")).toHaveLength(3);
    expect(
      screen.queryByTestId("add-project-list-row"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Please delete an existing project to create a new one.",
      ),
    ).toBeInTheDocument();
  });

  it("lets a card be opened unless it is shared with nothing granted", () => {
    h.getProjects.mockReturnValue({
      data: [
        group("g1", "Owned"),
        sharedGroup("g2", "Granted", ["people::view"]),
        sharedGroup("g3", "Grantless", []),
        sharedGroup("g4", "Unknown"),
      ],
      isLoading: false,
      isFetching: false,
    });

    render(<SelfProject canCreateProject />);

    const canOpen = screen
      .getAllByTestId("project-card")
      .map((card) => card.getAttribute("data-can-open"));

    // The last is an API older than `accessPolicies`: unknown reads as open, not as denied.
    expect(canOpen).toEqual(["true", "true", "false", "true"]);
  });
});
