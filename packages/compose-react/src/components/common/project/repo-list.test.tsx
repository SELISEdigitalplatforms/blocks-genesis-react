import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IProject } from "@/models";
import { ProjectRepoList } from "./repo-list";

const h = vi.hoisted(() => ({ getEnvRepositories: vi.fn() }));

vi.mock("@/hooks/use-project", () => ({
  useGetEnvRepositories: () => h.getEnvRepositories(),
}));
vi.mock("./repo-table", () => ({
  ProjectRepoTable: ({ data }: { data: unknown[] }) => (
    <div data-testid="repo-table">{data.length}</div>
  ),
}));

const project = {
  tenantId: "t1",
  environment: "dev",
  applications: [],
} as unknown as IProject;

describe("ProjectRepoList", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the skeleton while repositories are loading", () => {
    h.getEnvRepositories.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
    });

    render(<ProjectRepoList project={project} isLoading={false} />);

    expect(screen.queryByText("Repositories")).not.toBeInTheDocument();
  });

  it("renders the repositories table once loaded", () => {
    h.getEnvRepositories.mockReturnValue({
      data: { data: [{ itemId: "r1" }, { itemId: "r2" }] },
      isLoading: false,
      isFetching: false,
    });

    render(<ProjectRepoList project={project} isLoading={false} />);

    expect(screen.getByText("Repositories")).toBeInTheDocument();
    expect(screen.getByTestId("repo-table")).toHaveTextContent("2");
  });
});
