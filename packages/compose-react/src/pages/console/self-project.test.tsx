import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SelfProject } from "./self-project";

const h = vi.hoisted(() => ({ getProjects: vi.fn() }));

vi.mock("@/hooks/use-project", () => ({
  useGetProjects: () => h.getProjects(),
}));
vi.mock("@/components/common/project", () => ({
  ProjectCardLoadingSkeleton: () => <div data-testid="skeleton" />,
}));
vi.mock("./project-card", () => ({
  ProjectCard: ({ project }: { project: { name: string } }) => (
    <div data-testid="project-card">{project.name}</div>
  ),
}));
vi.mock("./add-project-card", () => ({
  AddProjectCard: () => <div data-testid="add-card" />,
}));
vi.mock("./console-create", () => ({
  default: () => <div data-testid="console-create" />,
}));

const group = (id: string, name: string) => ({
  tenantGroupId: id,
  projects: [{ tenantId: id, name }],
});

describe("SelfProject", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the loading skeletons while fetching", () => {
    h.getProjects.mockReturnValue({ isLoading: true, isFetching: true });

    render(<SelfProject />);

    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
    expect(screen.queryByText("Your Blocks Projects")).not.toBeInTheDocument();
  });

  it("renders the create-project flow when empty and creation is allowed", () => {
    h.getProjects.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
    });

    render(<SelfProject canCreateProject />);

    expect(screen.getByTestId("console-create")).toBeInTheDocument();
  });

  it("lists project cards with the add card when below the limit", () => {
    h.getProjects.mockReturnValue({
      data: [group("g1", "Alpha"), group("g2", "Beta")],
      isLoading: false,
      isFetching: false,
    });

    render(<SelfProject canCreateProject />);

    expect(screen.getByText("Your Blocks Projects")).toBeInTheDocument();
    expect(screen.getAllByTestId("project-card")).toHaveLength(2);
    expect(screen.getByTestId("add-card")).toBeInTheDocument();
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
});
