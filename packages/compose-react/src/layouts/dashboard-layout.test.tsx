import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { DashboardLayout } from "./dashboard-layout";

vi.mock("@/components", () => ({
  DashboardHeader: () => <div data-testid="header" />,
  SidebarMenuDesktop: () => <div data-testid="sidebar" />,
}));
vi.mock("@/guards/impersonation.guard", () => ({
  ImpersonationChecker: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
  ImpersonationSynchronizer: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));
vi.mock("@/providers/dashboard-layout.provider", () => ({
  DashboardLayoutProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));
vi.mock("@/components/core/agent-panel", () => ({
  AgentPanelProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

describe("DashboardLayout", () => {
  it("renders the sidebar, header and children", () => {
    render(
      <DashboardLayout redirectPaths={{}} navigationMenus={[]}>
        <span>page content</span>
      </DashboardLayout>,
    );

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("page content")).toBeInTheDocument();
  });

  it("applies a custom wrapper around the content", () => {
    render(
      <DashboardLayout
        redirectPaths={{}}
        navigationMenus={[]}
        wrapper={(content) => <div data-testid="wrapped">{content}</div>}
      >
        <span>page content</span>
      </DashboardLayout>,
    );

    expect(screen.getByTestId("wrapped")).toBeInTheDocument();
    expect(screen.getByText("page content")).toBeInTheDocument();
  });
});
