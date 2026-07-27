import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ConsoleCreateProject from "./console-create";

const h = vi.hoisted(() => ({
  handleClick: vi.fn(),
  isDisabled: false,
  isFetching: false,
}));

vi.mock("./use-create-project-redirect", () => ({
  useCreateProjectRedirect: () => ({
    handleClick: h.handleClick,
    isDisabled: h.isDisabled,
    isFetching: h.isFetching,
  }),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <ConsoleCreateProject />
    </MemoryRouter>,
  );

describe("ConsoleCreateProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.isDisabled = false;
    h.isFetching = false;
  });

  it("renders the welcome content and call to action", () => {
    renderPage();

    expect(screen.getByText("Welcome to SELISE Blocks")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create a project" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /View documentation/ }),
    ).toHaveAttribute("href", "https://docs.seliseblocks.com/");
  });

  it("shows a redirecting label while fetching", () => {
    h.isFetching = true;

    renderPage();

    expect(screen.getByText("Redirecting...")).toBeInTheDocument();
  });

  it("triggers the redirect handler on click", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Create a project" }));

    expect(h.handleClick).toHaveBeenCalled();
  });

  it("disables the button when the redirect is not ready", () => {
    h.isDisabled = true;

    renderPage();

    expect(
      screen.getByRole("button", { name: "Create a project" }),
    ).toBeDisabled();
  });
});
