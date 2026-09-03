import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectToolbar } from "./project-toolbar";

vi.mock("@/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/hooks")>()),
  useIsMobile: () => false,
  usePopoverWidth: () => [{ current: null }, undefined],
}));

const baseProps = {
  availableEnvironmentOptions: [
    { label: "Development", value: "dev" },
    { label: "Production", value: "prod" },
  ],
  environmentFilter: [] as string[],
  onEnvironmentFilterChange: vi.fn(),
  onReset: vi.fn(),
  onSearchTextChange: vi.fn(),
  onViewModeChange: vi.fn(),
  searchText: "",
  viewMode: "grid" as const,
};

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("ProjectToolbar", () => {
  it("debounces project-name searches by 300ms", () => {
    vi.useFakeTimers();
    render(<ProjectToolbar {...baseProps} />);

    fireEvent.change(screen.getByPlaceholderText("Search projects..."), {
      target: { value: "acme" },
    });

    act(() => vi.advanceTimersByTime(299));
    expect(baseProps.onSearchTextChange).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(baseProps.onSearchTextChange).toHaveBeenCalledWith("acme");
  });

  it("selects an environment from the shared filter control", async () => {
    const user = userEvent.setup();
    render(<ProjectToolbar {...baseProps} />);

    await user.click(screen.getByRole("button", { name: /Environment/ }));
    await user.click(await screen.findByText("Production"));

    expect(baseProps.onEnvironmentFilterChange).toHaveBeenCalledWith(["prod"]);
  });

  it("switches between grid and list view", async () => {
    const user = userEvent.setup();
    render(<ProjectToolbar {...baseProps} />);

    await user.click(screen.getByRole("radio", { name: "List view" }));

    expect(baseProps.onViewModeChange).toHaveBeenCalledWith("list");
  });

  it("shows Reset only for active search/filter state and clears both", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ProjectToolbar {...baseProps} />);

    expect(
      screen.queryByRole("button", { name: /Reset/ }),
    ).not.toBeInTheDocument();

    rerender(
      <ProjectToolbar
        {...baseProps}
        searchText="acme"
        environmentFilter={["prod"]}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Reset/ }));

    expect(baseProps.onReset).toHaveBeenCalledOnce();
  });
});
