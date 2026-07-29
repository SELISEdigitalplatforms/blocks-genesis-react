import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ startLogin: vi.fn() }));
vi.mock("@/services/login.service", () => ({ loginService: h }));

import { useLogin } from "./use-login";

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

beforeEach(() => {
  h.startLogin.mockReset();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { origin: "https://app.test", href: "" },
  });
});

describe("useLogin", () => {
  it("starts login and navigates to the redirect_uri on success", async () => {
    h.startLogin.mockResolvedValue({ redirect_uri: "https://idp/authorize" });

    const { result } = renderHook(() => useLogin(), { wrapper: wrapper() });

    act(() => result.current.start());

    await waitFor(() =>
      expect(window.location.href).toBe("https://idp/authorize"),
    );
    expect(h.startLogin.mock.calls[0]?.[0]).toEqual({
      redirectUri: "https://app.test/login/callback",
    });
    expect(result.current.isLoading).toBe(false);
  });

  it("does not navigate when no redirect_uri is returned", async () => {
    h.startLogin.mockResolvedValue({});

    const { result } = renderHook(() => useLogin(), { wrapper: wrapper() });

    act(() => result.current.start());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(window.location.href).toBe("");
  });

  it("surfaces thrown errors via the error field and resets loading", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    h.startLogin.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useLogin(), { wrapper: wrapper() });

    act(() => result.current.start());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(result.current.error?.message).toBe("network"));
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("dedupes concurrent start() calls", async () => {
    let resolveLogin: (value: unknown) => void = () => {};
    h.startLogin.mockImplementation(
      () => new Promise((resolve) => (resolveLogin = resolve)),
    );

    const { result } = renderHook(() => useLogin(), { wrapper: wrapper() });

    act(() => {
      result.current.start();
      result.current.start();
      result.current.start();
    });

    expect(h.startLogin).toHaveBeenCalledTimes(1);

    act(() => resolveLogin({}));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});
