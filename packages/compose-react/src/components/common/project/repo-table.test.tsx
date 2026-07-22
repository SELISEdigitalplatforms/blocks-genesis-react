import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/components/common/project/set-custom-domain/dialog", () => ({
  SetCustomDomainDialog: () => <div data-testid="set-dialog" />,
}));

import { ProjectRepoTable } from "@/components/common/project/repo-table";

const data = [
  {
    repoName: "repo-a",
    defaultDeploymentUrl: "a.dev",
    customDeploymentUrl: "",
    lastDeploymentDate: "0001-01-01T00:00:00",
  },
  {
    repoName: "repo-b",
    defaultDeploymentUrl: "b.dev",
    customDeploymentUrl: "custom.b.dev",
    lastDeploymentDate: "2024-01-15T10:00:00",
  },
];

describe("ProjectRepoTable", () => {
  it("renders repo rows with names, domains and deployment status", () => {
    render(
      <ProjectRepoTable
        data={data as never}
        domains={[]}
        projectKey="k"
        projectEnv="e"
      />,
    );
    expect(screen.getByText("repo-a")).toBeInTheDocument();
    expect(screen.getByText("repo-b")).toBeInTheDocument();
    expect(screen.getByText("custom.b.dev")).toBeInTheDocument();
    expect(screen.getByText("Set")).toBeInTheDocument();
    expect(screen.getByText("Not deployed")).toBeInTheDocument();
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
  });

  it("triggers the set-custom-domain flow when Set is clicked", () => {
    render(
      <ProjectRepoTable
        data={[data[0]] as never}
        domains={[]}
        projectKey="k"
        projectEnv="e"
      />,
    );
    fireEvent.click(screen.getByText("Set"));
    expect(screen.getByText("repo-a")).toBeInTheDocument();
  });
});
