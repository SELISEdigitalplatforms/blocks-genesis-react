import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AppConfigStoreState } from "@/store/app-config.store";
import { BlocksAppLayout } from "./blocks-app-layout.provider";

vi.mock("@/components/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/components/core")>()),
  Toaster: () => <div data-testid="toaster" />,
}));
vi.mock("@/store/app-config.store", () => ({
  CreateAppConfigStore: () => ({}),
}));

const renderLayout = (name: string) =>
  render(
    <BlocksAppLayout config={{ name } as AppConfigStoreState["config"]}>
      <span>app content</span>
    </BlocksAppLayout>,
  );

type EnvWindow = { __BLOCKS_ENV__?: unknown };
const originalEnv = (window as unknown as EnvWindow).__BLOCKS_ENV__;

/**
 * vitest.setup.ts installs a Proxy for __BLOCKS_ENV__ whose get trap answers
 * every key with the same stub value, so a written key cannot be read back.
 * Swap in a plain object and re-import the provider, which captures the
 * window.__BLOCKS_ENV__ reference at module load.
 */
const renderWithEnv = async (name: string, env: Record<string, string>) => {
  (window as unknown as { __BLOCKS_ENV__: Record<string, string> }).__BLOCKS_ENV__ =
    env;
  vi.resetModules();
  const { BlocksAppLayout: Reloaded } = await import(
    "./blocks-app-layout.provider"
  );
  render(
    <Reloaded config={{ name } as AppConfigStoreState["config"]}>
      <span>app content</span>
    </Reloaded>,
  );
};

afterEach(() => {
  (window as unknown as EnvWindow).__BLOCKS_ENV__ = originalEnv;
});

describe("BlocksAppLayout", () => {
  it("renders children and the toaster for the blocks-os app", () => {
    renderLayout("blocks-os");

    expect(screen.getByText("app content")).toBeInTheDocument();
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
  });

  it("renders children and the toaster for a non-os app", () => {
    renderLayout("blocks-logic");

    expect(screen.getByText("app content")).toBeInTheDocument();
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
  });

  describe("userBaseUrl", () => {
    const iamBaseUrl = "https://dev-iam.blocksdevelopers.com";

    it("uses the serving origin when the host app is blocks-iam", async () => {
      // IAM's API is same-origin with its own SPA, so the injected value would
      // send a preview host's calls to the canonical host instead of itself.
      await renderWithEnv("blocks-iam", { BLOCKS_IAM_BASE_URL: iamBaseUrl });

      expect(window.process?.env.userBaseUrl).toBe(window.location.origin);
    });

    it("uses the configured IAM base URL for every other app", async () => {
      await renderWithEnv("blocks-os", { BLOCKS_IAM_BASE_URL: iamBaseUrl });

      expect(window.process?.env.userBaseUrl).toBe(iamBaseUrl);
    });

    it("falls back to an empty string when the IAM base URL is unset", async () => {
      await renderWithEnv("blocks-logic", {});

      expect(window.process?.env.userBaseUrl).toBe("");
    });
  });
});
