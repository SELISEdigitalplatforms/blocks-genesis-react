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

import { ProjectList } from "@/components/common/project/list";
import { useProjectStore } from "@/store";

const wrap = (ui: ReactNode, entries = ["/console"]) =>
  render(<MemoryRouter initialEntries={entries}>{ui}</MemoryRouter>);

beforeEach(() => {
  navigate.mockReset();
  useProjectStore.getState().resetProjectStore();
  h.projects = {
    data: [
      { projects: [{ itemId: "p1", name: "Alpha" }] },
      { projects: [{ itemId: "p2", name: "Beta" }] },
    ],
    isLoading: false,
  };
  h.project = { data: undefined };
});

describe("ProjectList", () => {
  it("lists the available projects", () => {
    wrap(<ProjectList redirectPaths={{}} />);
    expect(screen.getByText("Your Projects")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("shows a loader while projects are loading", () => {
    h.projects = { data: [], isLoading: true };
    wrap(<ProjectList redirectPaths={{}} />);
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });

  it("selects a project when no redirect path matches", () => {
    wrap(<ProjectList redirectPaths={{}} />);
    fireEvent.click(screen.getByText("Alpha"));
    expect(useProjectStore.getState().selectedProject).toMatchObject({
      itemId: "p1",
    });
  });

  it("redirects instead of selecting when a redirect path matches", () => {
    wrap(<ProjectList redirectPaths={{ "/app/*": "/target" }} />, ["/app/foo"]);
    fireEvent.click(screen.getByText("Alpha"));
    expect(navigate).toHaveBeenCalledWith("/target", { replace: true });
  });

  it("renders the collapsed trigger variant", () => {
    wrap(<ProjectList redirectPaths={{}} collapsed />);
    expect(screen.getByText("Select a Project")).toBeInTheDocument();
  });
});
