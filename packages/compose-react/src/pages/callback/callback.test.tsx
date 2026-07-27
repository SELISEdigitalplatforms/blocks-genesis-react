import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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
      value: { href: "" },
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
    expect(window.location.href).toBe("/home");
  });

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
