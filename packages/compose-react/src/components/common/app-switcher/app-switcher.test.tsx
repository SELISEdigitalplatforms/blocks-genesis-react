import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createEvent,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/hooks/use-blocks-app-config-store", () => ({
  useBlocksAppConfigStore: (
    selector: (s: { getConfig: () => { name: string } }) => unknown,
  ) => selector({ getConfig: () => ({ name: "blocks-iam" }) }),
}));
const h = vi.hoisted(() => ({
  fetchRedirectUrl: vi.fn(),
}));

vi.mock("@/services/initiate.service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/services/initiate.service")>()),
  initiateService: { fetchRedirectUrl: h.fetchRedirectUrl },
}));

import { AppSwitcher } from "@/components/common/app-switcher/app-switcher";
import { AppSwitcherContent } from "@/components/common/app-switcher/app-switcher-content";
import type { ResolvedApp } from "@/components/common/app-switcher/use-app-redirect-urls";
import { InitiateError } from "@/services/initiate.service";

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

  // H7, §7 #1
  it("shows an app IAM rejected as unavailable instead of loading", async () => {
    h.fetchRedirectUrl.mockRejectedValue(
      new InitiateError(400, { code: "invalid_redirect_uri" }),
    );
    renderSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "SELISE Blocks apps" }));

    const tile = (await screen.findByText("OS")).closest("a");
    expect(tile).toHaveAttribute("aria-disabled", "true");
    expect(tile).not.toHaveAttribute("href");
    expect(tile).toHaveAccessibleDescription("OS is unavailable right now");
    expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
  });
});

/** The tile around a label; fails the test when the label is not inside one. */
const tileOf = (label: string): HTMLAnchorElement => {
  const anchor = screen.getByText(label).closest("a");
  if (!anchor) throw new Error(`No tile for ${label}`);
  return anchor;
};

describe("AppSwitcherContent tiles", () => {
  const tile = (
    label: string,
    state: Partial<ResolvedApp>,
    markUsed = vi.fn(),
  ): ResolvedApp => ({
    id: label.toLowerCase() as ResolvedApp["id"],
    label,
    description: "",
    url: "",
    icon: null,
    clientId: "BLOCKS_OS_CLIENT_ID",
    redirectUri: "BLOCKS_OS_CALLBACK_URL",
    initiateUrl: "",
    isLoading: false,
    isUnavailable: false,
    isDisabled: false,
    markUsed,
    ...state,
  });

  // H7, H8, H9: each tile follows its own state.
  it("renders ready, loading and unavailable tiles side by side", () => {
    render(
      <AppSwitcherContent
        apps={[
          tile("Agents", { isUnavailable: true }),
          tile("Data", { initiateUrl: "https://redirect.test/data" }),
          tile("Logic", { isLoading: true }),
        ]}
      />,
    );

    const agents = screen.getByText("Agents").closest("a");
    expect(agents).toHaveAttribute("aria-disabled", "true");
    expect(agents).not.toHaveAttribute("href");
    expect(agents).toHaveAttribute("title", "Agents is unavailable right now");
    expect(agents).toHaveClass("opacity-50", "cursor-default");
    expect(agents).not.toHaveClass("pointer-events-none");
    expect(screen.getByText("Agents")).toHaveClass("text-muted-foreground");

    const data = screen.getByText("Data").closest("a");
    expect(data).toHaveAttribute("href", "https://redirect.test/data");
    expect(data).toHaveAttribute("aria-disabled", "false");
    expect(data).not.toHaveAttribute("title");
    expect(screen.getByText("Data")).not.toHaveClass("text-muted-foreground");

    const loading = screen.getByText("Loading…").closest("a");
    expect(loading).not.toHaveAttribute("href");
    expect(loading).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByText("Logic")).not.toBeInTheDocument();
  });

  // C9
  it("neither navigates nor uses up a URL from an unavailable tile", () => {
    const markUsed = vi.fn();
    render(
      <AppSwitcherContent
        apps={[tile("Agents", { isUnavailable: true }, markUsed)]}
      />,
    );
    const agents = tileOf("Agents");

    const click = createEvent.click(agents);
    fireEvent(agents, click);
    fireEvent(agents, new MouseEvent("auxclick", { bubbles: true, button: 1 }));
    fireEvent.contextMenu(agents);
    fireEvent.dragStart(agents);

    expect(click.defaultPrevented).toBe(true);
    expect(markUsed).not.toHaveBeenCalled();
  });

  it("uses up the URL of a ready tile on a middle click", () => {
    const markUsed = vi.fn();
    render(
      <AppSwitcherContent
        apps={[
          tile("Data", { initiateUrl: "https://redirect.test/data" }, markUsed),
        ]}
      />,
    );

    fireEvent(
      tileOf("Data"),
      new MouseEvent("auxclick", { bubbles: true, button: 1 }),
    );

    expect(markUsed).toHaveBeenCalledTimes(1);
  });
});
