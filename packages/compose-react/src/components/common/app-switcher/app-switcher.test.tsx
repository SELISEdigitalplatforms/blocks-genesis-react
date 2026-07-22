import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/hooks/use-blocks-app-config-store", () => ({
  useBlocksAppConfigStore: (
    selector: (s: { getConfig: () => { name: string } }) => unknown,
  ) => selector({ getConfig: () => ({ name: "blocks-os" }) }),
}));
vi.mock("@/services/initiate.service", () => ({
  initiateService: {
    fetchRedirectUrl: vi.fn().mockResolvedValue("https://redirect.test"),
  },
}));

import { AppSwitcher } from "@/components/common/app-switcher/app-switcher";

describe("AppSwitcher", () => {
  it("opens the popover and lists the other blocks apps", async () => {
    render(<AppSwitcher />);
    fireEvent.click(
      screen.getByRole("button", { name: "SELISE Blocks apps" }),
    );
    expect(screen.getByText("SELISE Blocks")).toBeInTheDocument();
    expect(await screen.findByText("IAM")).toBeInTheDocument();
  });

  it("renders a grid of app tiles once redirect URLs resolve", async () => {
    render(<AppSwitcher />);
    fireEvent.click(
      screen.getByRole("button", { name: "SELISE Blocks apps" }),
    );
    await screen.findByText("IAM");
    expect(screen.getAllByRole("link").length).toBeGreaterThan(1);
  });
});
