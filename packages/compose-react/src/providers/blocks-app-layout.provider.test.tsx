import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
});
