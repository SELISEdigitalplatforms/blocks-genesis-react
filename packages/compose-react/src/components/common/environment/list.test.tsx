import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const h = vi.hoisted(() => ({
  projects: { data: [] as unknown[], isLoading: false },
  project: { data: undefined as unknown },
}));
const navigate = vi.fn();

vi.mock("@/hooks/use-project", () => ({
  useGetProjects: () => h.projects,
  useGetProject: () => h.project,
}));
vi.mock("react-router-dom", async (imp) => ({
  ...(await imp<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));
/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock("@/components", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onSelect, disabled }: any) => (
    <button disabled={disabled} onClick={onSelect}>
      {children}
    </button>
  ),
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

import { EnvironmentList } from "@/components/common/environment/list";
import { useProjectStore } from "@/store";

const wrap = (ui: ReactNode, entries = ["/console"]) =>
  render(<MemoryRouter initialEntries={entries}>{ui}</MemoryRouter>);

beforeEach(() => {
  navigate.mockReset();
  useProjectStore.getState().resetProjectStore();
  useProjectStore.getState().setSelectedProject({
    itemId: "p1",
    environment: "prod",
    customDomain: "x.com",
  } as never);
  h.projects = {
    data: [
      {
        projects: [
          { itemId: "p1", environment: "prod" },
          { itemId: "p2", environment: "staging" },
        ],
      },
    ],
    isLoading: false,
  };
  h.project = { data: undefined };
});

describe("EnvironmentList", () => {
  it("lists the other environments of the selected project group", () => {
    wrap(<EnvironmentList redirectPaths={{}} />);
    expect(screen.getByText("Your Environments")).toBeInTheDocument();
    expect(screen.getByText("staging")).toBeInTheDocument();
  });

  it("shows an empty state when there are no other environments", () => {
    h.projects = {
      data: [{ projects: [{ itemId: "p1", environment: "prod" }] }],
      isLoading: false,
    };
    wrap(<EnvironmentList redirectPaths={{}} />);
    expect(
      screen.getByText("No other environments available"),
    ).toBeInTheDocument();
  });

  it("selects an environment when no redirect path matches", () => {
    wrap(<EnvironmentList redirectPaths={{}} />);
    fireEvent.click(screen.getByText("staging"));
    expect(useProjectStore.getState().selectedProject).toMatchObject({
      itemId: "p2",
    });
  });

  it("redirects when a redirect path matches", () => {
    wrap(<EnvironmentList redirectPaths={{ "/app/*": "/target" }} />, [
      "/app/foo",
    ]);
    fireEvent.click(screen.getByText("staging"));
    expect(navigate).toHaveBeenCalledWith("/target", { replace: true });
  });

  it("renders the collapsed trigger variant", () => {
    wrap(<EnvironmentList redirectPaths={{}} collapsed />);
    expect(screen.getByText("Your Environments")).toBeInTheDocument();
  });
});
