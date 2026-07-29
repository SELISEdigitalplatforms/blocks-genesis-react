import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  name: "blocks-logic",
  startLogin: vi.fn(),
}));

vi.mock("@/hooks/use-blocks-app-config-store", () => ({
  useBlocksAppConfigStore: (
    selector: (s: { getConfig: () => { name: string } }) => unknown,
  ) => selector({ getConfig: () => ({ name: h.name }) }),
}));
vi.mock("@/services/login.service", () => ({
  loginService: { startLogin: h.startLogin },
}));
vi.mock("./blocks-login", () => ({
  BlocksLoginPage: ({
    name,
    onLogin,
    isLoading,
  }: {
    name: string;
    onLogin: () => void;
    isLoading: boolean;
  }) => (
    <div>
      <span data-testid="name">{name}</span>
      <span data-testid="loading">{String(isLoading)}</span>
      <button onClick={onLogin}>login</button>
    </div>
  ),
}));

import { LoginPage } from "./login";

const wrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { origin: "https://app.test", href: "" },
    });
    h.startLogin.mockResolvedValue({});
  });

  it("renders the login page with the app name", () => {
    render(<LoginPage />, { wrapper: wrapper() });

    expect(screen.getByTestId("name")).toHaveTextContent("blocks-logic");
  });

  it("triggers login and redirects to the initiate response url", async () => {
    h.startLogin.mockResolvedValue({ redirect_uri: "https://idp/authorize" });

    render(<LoginPage />, { wrapper: wrapper() });
    fireEvent.click(screen.getByText("login"));

    await waitFor(() =>
      expect(window.location.href).toBe("https://idp/authorize"),
    );
    expect(h.startLogin.mock.calls[0]?.[0]).toEqual({
      redirectUri: "https://app.test/login/callback",
    });
  });

  it("stops the loading state when no redirect url is returned", async () => {
    h.startLogin.mockResolvedValue({});

    render(<LoginPage />, { wrapper: wrapper() });
    fireEvent.click(screen.getByText("login"));

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("false"),
    );
    expect(window.location.href).toBe("");
  });

  it("logs and resets loading when the request throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    h.startLogin.mockRejectedValue(new Error("network"));

    render(<LoginPage />, { wrapper: wrapper() });
    fireEvent.click(screen.getByText("login"));

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("false"),
    );
  });
});
