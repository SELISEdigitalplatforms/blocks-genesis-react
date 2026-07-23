import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { IProject } from "@/models";
import { ProjectDetail } from "./detail";

const project = {
  name: "Acme",
  tenantId: "tenant-abcdef",
  environment: "dev",
  lastUpdatedDate: "2026-01-05T10:00:00Z",
  createdDate: "2026-01-01T10:00:00Z",
} as unknown as IProject;

describe("ProjectDetail", () => {
  it("renders the loading skeleton without the section title while loading", () => {
    render(<ProjectDetail isLoading project={project} />);

    expect(screen.queryByText("Project Details")).not.toBeInTheDocument();
  });

  it("renders the core project fields for a non-production environment", () => {
    render(<ProjectDetail isLoading={false} project={project} />);

    expect(screen.getByText("Project Details")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("X-Blocks-Key")).toBeInTheDocument();
    expect(screen.getByText("Development")).toBeInTheDocument();
  });

  it("shows the production badge for a production environment", () => {
    render(
      <ProjectDetail
        isLoading={false}
        project={{ ...project, environment: "prod" } as IProject}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Production" }),
    ).toBeInTheDocument();
  });

  it("renders without dates when the project omits them", () => {
    render(
      <ProjectDetail
        isLoading={false}
        project={
          {
            name: "NoDates",
            tenantId: "t",
            environment: "test",
          } as unknown as IProject
        }
      />,
    );

    expect(screen.getByText("NoDates")).toBeInTheDocument();
    expect(screen.getByText("Testing")).toBeInTheDocument();
  });
});
