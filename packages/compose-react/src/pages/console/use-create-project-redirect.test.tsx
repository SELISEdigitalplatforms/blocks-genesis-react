import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateProjectRedirect } from "./use-create-project-redirect";

const h = vi.hoisted(() => ({
  name: "blocks-data",
  isReady: false,
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
    isFetching: false,
    isReady: h.isReady,
    redirect: h.redirect,
  }),
}));
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => h.navigate,
}));

describe("useCreateProjectRedirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.name = "blocks-data";
    h.isReady = false;
  });

  it("navigates directly to create-project when inside blocks-os", () => {
    h.name = "blocks-os";

    const { result } = renderHook(() => useCreateProjectRedirect());
    result.current.handleClick();

    expect(h.navigate).toHaveBeenCalledWith("/app/create-project");
    expect(result.current.isDisabled).toBe(false);
  });

  it("triggers the prefetched redirect from another app", () => {
    h.name = "blocks-data";
    h.isReady = true;

    const { result } = renderHook(() => useCreateProjectRedirect());
    result.current.handleClick();

    expect(h.redirect).toHaveBeenCalled();
    expect(result.current.isDisabled).toBe(false);
  });

  it("is disabled while the redirect is not ready outside blocks-os", () => {
    h.name = "blocks-data";
    h.isReady = false;

    const { result } = renderHook(() => useCreateProjectRedirect());

    expect(result.current.isDisabled).toBe(true);
  });
});
