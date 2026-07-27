import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

const h = vi.hoisted(() => ({
  project: { data: undefined as unknown, isLoading: false },
  repos: {
    data: undefined as unknown,
    isLoading: false,
    isFetching: false,
  },
}));
vi.mock("@/hooks/use-project", () => ({
  useGetProject: () => h.project,
  useGetEnvRepositories: () => h.repos,
}));

import { GitCommandSnippet } from "@/pages/dashboard/dashboard-overview-sections/git-command-snippet";
import { useProjectStore } from "@/store";

const wrap = (ui: ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  useProjectStore.getState().resetProjectStore();
  useProjectStore
    .getState()
    .setSelectedProject({ itemId: "p1", tenantGroupId: "tg1" } as never);
  h.project = {
    data: {
      data: { environment: "prod", customDomain: "x.com", tenantId: "t1" },
    },
    isLoading: false,
  };
  h.repos = { data: { data: [] }, isLoading: false, isFetching: false };
});

describe("GitCommandSnippet", () => {
  it("shows a loading skeleton while data is loading", () => {
    h.project = { data: undefined, isLoading: true };
    wrap(<GitCommandSnippet />);
    expect(screen.queryByText("Git Commands")).not.toBeInTheDocument();
  });

  it("prompts to add a repository when none is linked", () => {
    wrap(<GitCommandSnippet />);
    expect(screen.getByText("Git Commands")).toBeInTheDocument();
    expect(screen.getByText("Add Repository")).toBeInTheDocument();
  });

  it("renders the git commands when a repository is linked", () => {
    h.repos = {
      data: {
        data: [{ defaultDeploymentUrl: "x.com", repoUrl: "https://git/repo" }],
      },
      isLoading: false,
      isFetching: false,
    };
    wrap(<GitCommandSnippet />);
    expect(screen.getByText("Git Commands")).toBeInTheDocument();
    expect(screen.queryByText("Add Repository")).not.toBeInTheDocument();
  });
});
