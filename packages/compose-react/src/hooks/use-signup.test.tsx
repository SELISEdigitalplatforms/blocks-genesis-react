import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  getSignUpSetting: vi.fn(),
  getRuntimeEnv: vi.fn(),
  startFlow: vi.fn(),
}));

vi.mock("@/services/signup.service", () => ({
  signUpService: { getSignUpSetting: h.getSignUpSetting },
}));
vi.mock("@/services/login.service", () => ({
  loginService: { startFlow: h.startFlow },
}));
vi.mock("@/lib/runtime-env", () => ({ getRuntimeEnv: h.getRuntimeEnv }));

import { useSignUpAffordance, useSignUpRedirect } from "./use-signup";

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

const setting = (isSignUpEnable: boolean) => ({
  isSignUpEnable,
  isEmailPasswordSignUpEnabled: true,
  isSSoSignUpEnabled: false,
  defaultRolesForNewUser: [],
  defaultPermissionsForNewUser: [],
});

beforeEach(() => {
  h.getSignUpSetting.mockReset();
  h.getRuntimeEnv.mockReset().mockReturnValue("tenant-1");
  h.startFlow.mockReset();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { origin: "https://app.test", href: "" },
  });
});

describe("useSignUpAffordance", () => {
  it("offers the control when the tenant has signup enabled", async () => {
    h.getSignUpSetting.mockResolvedValue(setting(true));

    const { result } = renderHook(() => useSignUpAffordance(), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current.canSignUp).toBe(true));
  });

  it("offers nothing when the tenant has signup disabled", async () => {
    h.getSignUpSetting.mockResolvedValue(setting(false));

    const { result } = renderHook(() => useSignUpAffordance(), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canSignUp).toBe(false);
  });

  it("offers nothing and asks nothing when no tenant is configured", async () => {
    h.getRuntimeEnv.mockReturnValue("");

    const { result } = renderHook(() => useSignUpAffordance(), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canSignUp).toBe(false);
    expect(h.getSignUpSetting).not.toHaveBeenCalled();
  });

  it("fails closed when the settings call errors", async () => {
    h.getSignUpSetting.mockRejectedValue(new Error("unreachable"));

    const { result } = renderHook(() => useSignUpAffordance(), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canSignUp).toBe(false);
  });
});

describe("useSignUpRedirect", () => {
  it("asks IAM for the signup flow and navigates to what it returns", async () => {
    h.startFlow.mockResolvedValue({
      redirect_uri: "https://iam.test/oidc/signup/tenant-1?clientId=c",
      flow: "signup",
    });

    const { result } = renderHook(() => useSignUpRedirect(), {
      wrapper: wrapper(),
    });
    act(() => result.current.start());

    await waitFor(() =>
      expect(window.location.href).toBe(
        "https://iam.test/oidc/signup/tenant-1?clientId=c",
      ),
    );
    expect(h.startFlow).toHaveBeenCalledWith({
      redirectUri: "https://app.test/login/callback",
      flow: "signup",
    });
  });

  it("accepts a signup url even when the server does not echo the flow", async () => {
    h.startFlow.mockResolvedValue({
      redirect_uri: "https://iam.test/oidc/signup/tenant-1",
    });

    const { result } = renderHook(() => useSignUpRedirect(), {
      wrapper: wrapper(),
    });
    act(() => result.current.start());

    await waitFor(() =>
      expect(window.location.href).toBe(
        "https://iam.test/oidc/signup/tenant-1",
      ),
    );
  });

  it("refuses to navigate when an older IAM answers with the authorize url", async () => {
    // The `flow` parameter is unknown to that server, so it starts a login instead.
    // Redirecting would look like a UI bug rather than a version mismatch.
    vi.spyOn(console, "error").mockImplementation(() => {});
    h.startFlow.mockResolvedValue({
      redirect_uri: "https://iam.test/api/oidc/authorize?client_id=c",
    });

    const { result } = renderHook(() => useSignUpRedirect(), {
      wrapper: wrapper(),
    });
    act(() => result.current.start());

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(window.location.href).toBe("");
  });

  it("surfaces the error when the request is rejected", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    h.startFlow.mockRejectedValue(new Error("invalid_client"));

    const { result } = renderHook(() => useSignUpRedirect(), {
      wrapper: wrapper(),
    });
    act(() => result.current.start());

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(window.location.href).toBe("");
  });

  it("ignores repeat clicks while a request is in flight", async () => {
    h.startFlow.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ redirect_uri: "https://iam.test/oidc/signup/t" }),
            10,
          ),
        ),
    );

    const { result } = renderHook(() => useSignUpRedirect(), {
      wrapper: wrapper(),
    });
    act(() => {
      result.current.start();
      result.current.start();
      result.current.start();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(h.startFlow).toHaveBeenCalledTimes(1);
  });
});
