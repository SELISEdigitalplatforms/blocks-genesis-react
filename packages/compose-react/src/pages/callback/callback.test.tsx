import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CallbackPage } from "./callback";

const h = vi.hoisted(() => ({ setAuthenticated: vi.fn() }));

vi.mock("@/store", () => ({
  useAuthStore: () => ({ setAuthenticated: h.setAuthenticated }),
}));

const renderCallback = (search: string) =>
  render(
    <MemoryRouter initialEntries={[`/callback${search}`]}>
      <CallbackPage />
    </MemoryRouter>,
  );

describe("CallbackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as unknown as { process: unknown }).process = {
      env: { userBaseUrl: "https://idp.test", BLOCKS_X_BLOCKS_KEY: "tid" },
    };
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "", origin: "https://app.test" },
    });
  });

  it("renders a loading spinner", () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    const { container } = renderCallback("?code=abc");

    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("authenticates and redirects to the forwarded url on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));

    renderCallback("?code=abc&state=xyz&forwardedTo=/home");

    await waitFor(() => expect(h.setAuthenticated).toHaveBeenCalled());
    expect(window.location.href).toBe("https://app.test/home");
  });

  it("keeps the query and hash of a safe forwardedTo", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));

    renderCallback(
      `?code=abc&state=xyz&forwardedTo=${encodeURIComponent("/orders?id=7#top")}`,
    );

    await waitFor(() => expect(h.setAuthenticated).toHaveBeenCalled());
    expect(window.location.href).toBe("https://app.test/orders?id=7#top");
  });

  it.each([
    ["https://evil.example/x"],
    ["//evil.example/x"],
    ["/\\evil.example/x"],
    ["javascript:alert(1)"],
    ["/\t/evil.example/x"],
    ["/\n/evil.example/x"],
    ["/\t\\evil.example/x"],
  ])("ignores an unsafe forwardedTo (%s) and goes to /", async (target) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));

    renderCallback(
      `?code=abc&state=xyz&forwardedTo=${encodeURIComponent(target)}`,
    );

    await waitFor(() => expect(h.setAuthenticated).toHaveBeenCalled());
    expect(window.location.href).toBe("/");
  });

  it.each([
    ["/.//evil.example/x"],
    ["/..//evil.example/x"],
    ["/a/..//evil.example/x"],
    ["/%2e//evil.example/x"],
    ["/./\\evil.example/x"],
  ])(
    "keeps a dot-segment forwardedTo (%s) on the app origin",
    async (target) => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));

      renderCallback(
        `?code=abc&state=xyz&forwardedTo=${encodeURIComponent(target)}`,
      );

      await waitFor(() => expect(h.setAuthenticated).toHaveBeenCalled());
      expect(new URL(window.location.href).origin).toBe("https://app.test");
    },
  );

  it("redirects to the login error page when the callback fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    renderCallback("?code=abc");

    await waitFor(() =>
      expect(window.location.href).toBe("/login?error=callback_failed"),
    );
    expect(h.setAuthenticated).not.toHaveBeenCalled();
  });

  it("redirects to the login error page when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    renderCallback("?code=abc");

    await waitFor(() =>
      expect(window.location.href).toBe("/login?error=callback_error"),
    );
  });
});
