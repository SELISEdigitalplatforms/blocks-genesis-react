import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/hooks/use-blocks-app-config-store", () => ({
  useBlocksAppConfigStore: (
    selector: (s: { getConfig: () => { name: string } }) => unknown,
  ) => selector({ getConfig: () => ({ name: "blocks-iam" }) }),
}));
const h = vi.hoisted(() => ({
  fetchRedirectUrl: vi.fn(),
}));

vi.mock("@/services/initiate.service", () => ({
  initiateService: { fetchRedirectUrl: h.fetchRedirectUrl },
}));

import { AppSwitcher } from "@/components/common/app-switcher/app-switcher";

const renderSwitcher = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AppSwitcher />
    </QueryClientProvider>,
  );

describe("AppSwitcher", () => {
  beforeEach(() => {
    h.fetchRedirectUrl.mockReset().mockResolvedValue("https://redirect.test");
  });

  it("opens the popover and lists the other blocks apps", async () => {
    renderSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "SELISE Blocks apps" }));
    expect(screen.getByText("SELISE Blocks")).toBeInTheDocument();
    expect(await screen.findByText("OS")).toBeInTheDocument();
  });

  it("renders a grid of app tiles once redirect URLs resolve", async () => {
    renderSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "SELISE Blocks apps" }));
    await screen.findByText("OS");
    expect(screen.getAllByRole("link").length).toBeGreaterThan(1);
  });

  it("refetches only the app whose link was used from the context menu", async () => {
    renderSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "SELISE Blocks apps" }));
    const link = (await screen.findByText("OS")).closest("a");
    const firstRound = h.fetchRedirectUrl.mock.calls.length;

    // "Open in new tab" and "Copy link" both start here, and either uses up the URL's state.
    fireEvent.contextMenu(link!);

    await waitFor(() =>
      expect(h.fetchRedirectUrl).toHaveBeenCalledTimes(firstRound + 1),
    );
  });
});
