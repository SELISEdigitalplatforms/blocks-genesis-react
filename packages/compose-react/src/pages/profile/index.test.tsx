import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfilePage } from "./index";

const h = vi.hoisted(() => ({
  isLoading: false,
  error: null as Error | null,
}));

vi.mock("@/hooks/use-initiate", () => ({
  useInitiateRedirect: () => ({ isLoading: h.isLoading, error: h.error }),
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    h.isLoading = false;
    h.error = null;
  });

  it("shows the error state when the redirect fails", () => {
    h.error = new Error("boom");

    render(<ProfilePage />);

    expect(
      screen.getByText("Failed to redirect to profile page"),
    ).toBeInTheDocument();
  });

  it("shows the loading state while redirecting", () => {
    h.isLoading = true;

    render(<ProfilePage />);

    expect(
      screen.getByText("Redirecting to profile page…"),
    ).toBeInTheDocument();
  });

  it("renders nothing once the redirect has been dispatched", () => {
    const { container } = render(<ProfilePage />);

    expect(container).toBeEmptyDOMElement();
  });
});
