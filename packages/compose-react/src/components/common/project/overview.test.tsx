import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectOverview } from "./overview";

describe("ProjectOverview", () => {
  it("renders the skeleton while fetching", () => {
    render(
      <ProjectOverview
        name="Acme"
        environment="dev"
        tenantId="tenant-1"
        isFetching
      />,
    );

    expect(screen.queryByText("Acme")).not.toBeInTheDocument();
  });

  it("renders the name, environment badge and key label", () => {
    render(
      <ProjectOverview name="Acme" environment="dev" tenantId="tenant-1" />,
    );

    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("dev")).toBeInTheDocument();
    expect(screen.getByText("X-Blocks-Key:")).toBeInTheDocument();
  });
});
