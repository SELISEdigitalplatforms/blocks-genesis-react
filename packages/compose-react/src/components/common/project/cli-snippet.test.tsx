import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectCliSnippet } from "./cli-snippet";

const h = vi.hoisted(() => ({
  getProject: vi.fn(),
  selectedProject: { itemId: "item-1", tenantId: "t" } as
    { itemId: string; tenantId: string } | undefined,
}));

vi.mock("@/components", () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: ReactNode }) => <h3>{children}</h3>,
  Skeleton: () => <div data-testid="skeleton" />,
  CopyableSnippet: ({ code }: { code: string }) => <pre>{code}</pre>,
}));

vi.mock("@/hooks/use-project", () => ({
  useGetProject: () => h.getProject(),
}));
vi.mock("@/store", () => ({
  useProjectStore: () => ({ selectedProject: h.selectedProject }),
}));
vi.mock("@/utils/domain", () => ({
  getProjectBlocksApiUrl: () => "https://api.example.com",
}));

describe("ProjectCliSnippet", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the loading skeleton while the project loads", () => {
    h.getProject.mockReturnValue({ data: undefined, isLoading: true });

    render(<ProjectCliSnippet />);

    expect(
      screen.queryByText("Frontend Setup commands"),
    ).not.toBeInTheDocument();
    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
  });

  it("builds the CLI setup command from the loaded project", () => {
    h.getProject.mockReturnValue({
      data: {
        data: {
          name: "My App",
          tenantId: "tid",
          customDomain: "app.example.com",
          tenantSlug: "my-app",
        },
      },
      isLoading: false,
    });

    render(<ProjectCliSnippet />);

    expect(screen.getByText("Frontend Setup commands")).toBeInTheDocument();
    expect(screen.getAllByText(/blocks new web my_app/).length).toBeGreaterThan(
      0,
    );
  });
});
