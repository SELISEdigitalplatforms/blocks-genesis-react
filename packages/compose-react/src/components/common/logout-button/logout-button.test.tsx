import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LogOutButton } from "./logout-button";

const h = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
  clear: vi.fn(),
  resetProjectStore: vi.fn(),
  setUnAuthenticated: vi.fn(),
  clearTokens: vi.fn(),
  setSettings: vi.fn(),
}));

vi.mock("@/hooks/use-logout", () => ({
  useLogout: () => ({ mutateAsync: h.mutateAsync, isPending: h.isPending }),
}));
vi.mock("@/providers/query-client", () => ({
  getQueryClient: () => ({ clear: h.clear }),
}));
vi.mock("@/store", () => ({
  useAppSettingsStore: () => ({ setSettings: h.setSettings }),
}));
vi.mock("@/store/auth.store", () => ({
  useAuthStore: () => ({
    setUnAuthenticated: h.setUnAuthenticated,
    clearTokens: h.clearTokens,
  }),
}));
vi.mock("@/store/project.store", () => ({
  useProjectStore: () => ({ resetProjectStore: h.resetProjectStore }),
}));

const replaceMock = vi.fn();

describe("LogOutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.isPending = false;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { replace: replaceMock, origin: "https://app.test" },
    });
  });

  it("renders the logout button, disabled while pending", () => {
    h.isPending = true;

    render(<LogOutButton />);

    expect(screen.getByRole("button", { name: "Logout" })).toBeDisabled();
  });

  it("clears session state and redirects to login on click", async () => {
    h.mutateAsync.mockResolvedValue(undefined);

    render(<LogOutButton />);
    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => expect(h.mutateAsync).toHaveBeenCalled());
    expect(h.resetProjectStore).toHaveBeenCalled();
    expect(h.setUnAuthenticated).toHaveBeenCalled();
    expect(h.clearTokens).toHaveBeenCalled();
    expect(h.setSettings).toHaveBeenCalledWith({ language: "en" });
    expect(h.clear).toHaveBeenCalled();
    expect(replaceMock).toHaveBeenCalledWith("https://app.test/login");
  });

  it("does not redirect when logout fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    h.mutateAsync.mockRejectedValue(new Error("boom"));

    render(<LogOutButton />);
    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => expect(h.mutateAsync).toHaveBeenCalled());
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
