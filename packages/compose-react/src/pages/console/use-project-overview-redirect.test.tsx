import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProjectOverviewRedirect } from "./use-project-overview-redirect";

const h = vi.hoisted(() => ({
  name: "blocks-data",
  isReady: false,
  isFetching: false,
  redirect: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("@/hooks/use-blocks-app-config-store", () => ({
  useBlocksAppConfigStore: (
    selector: (s: { config: { name: string } }) => unknown,
  ) => selector({ config: { name: h.name } }),
}));
vi.mock("@/hooks/use-initiate", () => ({
  usePrefetchRedirect: () => ({
    isFetching: h.isFetching,
    isReady: h.isReady,
    redirect: h.redirect,
  }),
}));
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => h.navigate,
}));

describe("useProjectOverviewRedirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.name = "blocks-data";
    h.isReady = false;
  });

  it("navigates directly when running inside blocks-os", () => {
    h.name = "blocks-os";

    const { result } = renderHook(() =>
      useProjectOverviewRedirect({ tenantGroupId: "tg1" }),
    );
    result.current.handleClick();

    expect(h.navigate).toHaveBeenCalledWith("/app/project/tg1/environments");
    expect(result.current.isDisabled).toBe(false);
  });

  it("triggers the prefetched redirect from another app", () => {
    h.name = "blocks-data";
    h.isReady = true;

    const { result } = renderHook(() =>
      useProjectOverviewRedirect({ tenantGroupId: "tg1" }),
    );
    result.current.handleClick();

    expect(h.redirect).toHaveBeenCalled();
    expect(result.current.isDisabled).toBe(false);
  });

  it("is disabled while the redirect is not ready outside blocks-os", () => {
    h.name = "blocks-data";
    h.isReady = false;

    const { result } = renderHook(() =>
      useProjectOverviewRedirect({ tenantGroupId: "tg1" }),
    );

    expect(result.current.isDisabled).toBe(true);
  });
});
