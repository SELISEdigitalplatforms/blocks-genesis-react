import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  getSignUpSetting: vi.fn(),
  getRuntimeEnv: vi.fn(),
  resolveBaseUrl: vi.fn(),
}));

vi.mock("@/services/signup.service", () => ({ signUpService: h }));
vi.mock("@/lib/runtime-env", () => ({ getRuntimeEnv: h.getRuntimeEnv }));
vi.mock("@/lib/http/util", () => ({ resolveBaseUrl: h.resolveBaseUrl }));

import { useSignUpAffordance } from "./use-signup";

const wrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
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
  h.resolveBaseUrl.mockReset().mockReturnValue("https://iam.test");
});

describe("useSignUpAffordance", () => {
  it("builds the tenant-scoped signup url when the tenant has signup enabled", async () => {
    h.getSignUpSetting.mockResolvedValue(setting(true));

    const { result } = renderHook(() => useSignUpAffordance(), {
      wrapper: wrapper(),
    });

    await waitFor(() =>
      expect(result.current.signUpUrl).toBe(
        "https://iam.test/oidc/signup/tenant-1",
      ),
    );
  });

  it("trims a trailing slash off the IAM base url", async () => {
    h.resolveBaseUrl.mockReturnValue("https://iam.test/");
    h.getSignUpSetting.mockResolvedValue(setting(true));

    const { result } = renderHook(() => useSignUpAffordance(), {
      wrapper: wrapper(),
    });

    await waitFor(() =>
      expect(result.current.signUpUrl).toBe(
        "https://iam.test/oidc/signup/tenant-1",
      ),
    );
  });

  it("offers no url when the tenant has signup disabled", async () => {
    h.getSignUpSetting.mockResolvedValue(setting(false));

    const { result } = renderHook(() => useSignUpAffordance(), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.signUpUrl).toBeUndefined();
  });

  it("offers no url and asks nothing when no tenant is configured", async () => {
    h.getRuntimeEnv.mockReturnValue("");

    const { result } = renderHook(() => useSignUpAffordance(), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.signUpUrl).toBeUndefined();
    expect(h.getSignUpSetting).not.toHaveBeenCalled();
  });

  it("offers no url and asks nothing when no IAM host is configured", async () => {
    h.resolveBaseUrl.mockReturnValue("");

    const { result } = renderHook(() => useSignUpAffordance(), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.signUpUrl).toBeUndefined();
    expect(h.getSignUpSetting).not.toHaveBeenCalled();
  });

  it("fails closed when the settings call errors", async () => {
    h.getSignUpSetting.mockRejectedValue(new Error("unreachable"));

    const { result } = renderHook(() => useSignUpAffordance(), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.signUpUrl).toBeUndefined();
  });
});
