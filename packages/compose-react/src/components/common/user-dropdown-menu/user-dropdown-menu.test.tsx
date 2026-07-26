import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const h = vi.hoisted(() => ({
  userInfo: { data: undefined as unknown },
  logout: { isPending: false, mutateAsync: vi.fn() },
  orgs: { data: undefined as unknown, isLoading: false },
  clear: vi.fn(),
}));

vi.mock("@/hooks/use-user", () => ({ useGetUserInfo: () => h.userInfo }));
vi.mock("@/hooks/use-logout", () => ({ useLogout: () => h.logout }));
vi.mock("@/hooks/use-organization", () => ({
  useGetMyOrganizations: () => h.orgs,
}));
vi.mock("@/providers", () => ({ getQueryClient: () => ({ clear: h.clear }) }));

import { UserDropdownMenu } from "@/components/common/user-dropdown-menu/user-dropdown-menu";
import { useUserStore } from "@/store";

const originalLocation = window.location;
const wrap = (ui: ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  h.userInfo = {
    data: {
      data: {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@x.com",
        roles: { r: ["admin"] },
        lastUsedOrganizationId: "o1",
      },
    },
  };
  h.logout = { isPending: false, mutateAsync: vi.fn().mockResolvedValue(undefined) };
  h.orgs = {
    data: {
      organizations: [
        { itemId: "o1", name: "Acme" },
        { itemId: "o2", name: "Beta" },
      ],
    },
    isLoading: false,
  };
  h.clear.mockReset();
  useUserStore
    .getState()
    .setUserDetails({ firstName: "Jane", lastName: "Doe" } as never);
});

afterEach(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
  });
});

describe("UserDropdownMenu", () => {
  it("opens the menu and shows the header, profile and organizations", async () => {
    const user = userEvent.setup();
    wrap(<UserDropdownMenu />);
    await user.click(screen.getByRole("button", { name: "Open user menu" }));
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@x.com")).toBeInTheDocument();
    expect(screen.getByText("My Profile")).toBeInTheDocument();
    expect(screen.getByText("Organizations")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });

  it("logs out and redirects to /login", async () => {
    const user = userEvent.setup();
    const replace = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { origin: "https://app.test", replace },
    });
    wrap(<UserDropdownMenu />);
    await user.click(screen.getByRole("button", { name: "Open user menu" }));
    await user.click(screen.getByText("Log out"));
    await waitFor(() => expect(h.logout.mutateAsync).toHaveBeenCalled());
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("https://app.test/login"),
    );
  });
});
