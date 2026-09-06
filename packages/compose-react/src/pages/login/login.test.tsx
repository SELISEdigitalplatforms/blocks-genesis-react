import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  name: "blocks-logic",
  startFlow: vi.fn(),
  getSignUpSetting: vi.fn(),
}));

vi.mock("@/services/signup.service", () => ({
  signUpService: { getSignUpSetting: h.getSignUpSetting },
}));

vi.mock("@/hooks/use-blocks-app-config-store", () => ({
  useBlocksAppConfigStore: (
    selector: (s: { getConfig: () => { name: string } }) => unknown,
  ) => selector({ getConfig: () => ({ name: h.name }) }),
}));
vi.mock("@/services/login.service", () => ({
  loginService: { startFlow: h.startFlow },
}));
vi.mock("./blocks-login", () => ({
  BlocksLoginPage: ({
    name,
    onLogin,
    isLoading,
    showSignUp,
    onSignUp,
  }: {
    name: string;
    onLogin: () => void;
    isLoading: boolean;
    showSignUp?: boolean;
    onSignUp?: () => void;
  }) => (
    <div>
      <span data-testid="name">{name}</span>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="show-signup">{String(showSignUp)}</span>
      <button onClick={onLogin}>login</button>
      <button onClick={onSignUp}>signup</button>
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
    h.startFlow.mockResolvedValue({});
    h.getSignUpSetting.mockResolvedValue({
      isSignUpEnable: true,
      isEmailPasswordSignUpEnabled: true,
      isSSoSignUpEnabled: false,
      defaultRolesForNewUser: [],
      defaultPermissionsForNewUser: [],
    });
  });

  it("renders the login page with the app name", () => {
    render(<LoginPage />, { wrapper: wrapper() });

    expect(screen.getByTestId("name")).toHaveTextContent("blocks-logic");
  });

  it("triggers login and redirects to the initiate response url", async () => {
    h.startFlow.mockResolvedValue({ redirect_uri: "https://idp/authorize" });

    render(<LoginPage />, { wrapper: wrapper() });
    fireEvent.click(screen.getByText("login"));

    await waitFor(() =>
      expect(window.location.href).toBe("https://idp/authorize"),
    );
    expect(h.startFlow.mock.calls[0]?.[0]).toEqual({
      redirectUri: "https://app.test/login/callback",
    });
  });

  it("stops the loading state when no redirect url is returned", async () => {
    h.startFlow.mockResolvedValue({});

    render(<LoginPage />, { wrapper: wrapper() });
    fireEvent.click(screen.getByText("login"));

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("false"),
    );
    expect(window.location.href).toBe("");
  });

  it("asks for the signup flow and redirects to the signup page", async () => {
    h.startFlow.mockResolvedValue({
      redirect_uri: "https://iam.test/oidc/signup/tenant-1",
      flow: "signup",
    });

    render(<LoginPage />, { wrapper: wrapper() });
    fireEvent.click(screen.getByText("signup"));

    await waitFor(() =>
      expect(window.location.href).toBe(
        "https://iam.test/oidc/signup/tenant-1",
      ),
    );
    expect(h.startFlow.mock.calls[0]?.[0]).toEqual({
      redirectUri: "https://app.test/login/callback",
      flow: "signup",
    });
  });

  it("logs and resets loading when the request throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    h.startFlow.mockRejectedValue(new Error("network"));

    render(<LoginPage />, { wrapper: wrapper() });
    fireEvent.click(screen.getByText("login"));

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("false"),
    );
  });
});
