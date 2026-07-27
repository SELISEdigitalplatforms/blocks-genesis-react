import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "./login";

const h = vi.hoisted(() => ({ name: "blocks-logic" }));

vi.mock("@/hooks/use-blocks-app-config-store", () => ({
  useBlocksAppConfigStore: (
    selector: (s: { getConfig: () => { name: string } }) => unknown,
  ) => selector({ getConfig: () => ({ name: h.name }) }),
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

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as unknown as { process: unknown }).process = {
      env: {
        BLOCKS_X_BLOCKS_KEY: "tid",
        BLOCKS_OIDC_CLIENT_ID: "cid",
        userBaseUrl: "https://idp.test",
      },
    };
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "", origin: "https://app.test" },
    });
  });

  it("renders the login page with the app name", () => {
    render(<LoginPage />);

    expect(screen.getByTestId("name")).toHaveTextContent("blocks-logic");
  });

  it("redirects to the initiate response url on login", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ redirect_uri: "https://idp/authorize" }),
      }),
    );

    render(<LoginPage />);
    fireEvent.click(screen.getByText("login"));

    await waitFor(() =>
      expect(window.location.href).toBe("https://idp/authorize"),
    );
  });

  it("stops the loading state when no redirect url is returned", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: () => Promise.resolve({}) }),
    );

    render(<LoginPage />);
    fireEvent.click(screen.getByText("login"));

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("false"),
    );
    expect(window.location.href).toBe("");
  });

  it("logs and resets loading when the request throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    render(<LoginPage />);
    fireEvent.click(screen.getByText("login"));

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("false"),
    );
  });
});
