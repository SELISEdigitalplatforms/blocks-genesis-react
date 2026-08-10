import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  RightSidePanel,
  RightSidePanelBody,
  RightSidePanelClose,
  RightSidePanelDescription,
  RightSidePanelFooter,
  RightSidePanelHeader,
  RightSidePanelProvider,
  RightSidePanelTitle,
  RightSidePanelTrigger,
} from "./index";

function Probe({
  defaultOpen,
  open,
  onOpenChange,
  syncHash,
  shortcut,
  width,
  resizable,
}: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  syncHash?: boolean;
  shortcut?: false | string;
  width?: number | string;
  resizable?: boolean;
}) {
  return (
    <RightSidePanelProvider
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      syncHash={syncHash}
      shortcut={shortcut}
      width={width}
      resizable={resizable}
    >
      <RightSidePanelTrigger ariaLabel="Open assistant" />
      <RightSidePanel ariaLabel="Assistant">
        <RightSidePanelHeader>
          <RightSidePanelTitle>Assistant</RightSidePanelTitle>
          <RightSidePanelDescription>Ask anything</RightSidePanelDescription>
          <RightSidePanelClose />
        </RightSidePanelHeader>
        <RightSidePanelBody>Body content</RightSidePanelBody>
        <RightSidePanelFooter>Footer content</RightSidePanelFooter>
      </RightSidePanel>
    </RightSidePanelProvider>
  );
}

describe("RightSidePanelProvider", () => {
  beforeEach(() => {
    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  });

  it("opens and closes via the trigger in uncontrolled mode", async () => {
    render(<Probe />);
    expect(screen.queryByText("Assistant")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /open assistant/i }));
    await waitFor(() =>
      expect(screen.getByText("Assistant")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /close panel/i }));
    await waitFor(() =>
      expect(screen.queryByText("Assistant")).not.toBeInTheDocument(),
    );
  });

  it("writes #right-side-panel to the location hash when syncHash is enabled", async () => {
    render(<Probe syncHash />);
    fireEvent.click(screen.getByRole("button", { name: /open assistant/i }));
    await waitFor(() => expect(window.location.hash).toBe("#right-side-panel"));
  });

  it("does not write to the hash when syncHash is false", async () => {
    render(<Probe syncHash={false} />);
    fireEvent.click(screen.getByRole("button", { name: /open assistant/i }));
    expect(window.location.hash).toBe("");
  });

  it("opens when the URL already contains #right-side-panel on mount", async () => {
    window.history.replaceState(null, "", "#right-side-panel");
    render(<Probe syncHash />);
    await waitFor(() =>
      expect(screen.getByText("Assistant")).toBeInTheDocument(),
    );
  });

  it("is fully controlled when open + onOpenChange are provided", () => {
    const onOpenChange = vi.fn();
    render(<Probe open={false} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole("button", { name: /open assistant/i }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText("Assistant")).not.toBeInTheDocument();
  });

  it("toggles via the default mod+j shortcut outside editable elements", async () => {
    render(<Probe />);
    fireEvent.keyDown(document, { key: "j", ctrlKey: true });
    await waitFor(() =>
      expect(screen.getByText("Assistant")).toBeInTheDocument(),
    );
  });

  it("does not toggle the shortcut while focus is in an input", () => {
    render(
      <>
        <input data-testid="text" />
        <Probe />
      </>,
    );
    fireEvent.keyDown(screen.getByTestId("text"), { key: "j", ctrlKey: true });
    expect(screen.queryByText("Assistant")).not.toBeInTheDocument();
  });

  it("does not bind the shortcut listener when shortcut=false", () => {
    render(<Probe shortcut={false} />);
    fireEvent.keyDown(document, { key: "j", metaKey: true });
    expect(screen.queryByText("Assistant")).not.toBeInTheDocument();
  });
});

describe("RightSidePanelTrigger (asChild)", () => {
  it("forwards onClick and aria attributes to the child element", () => {
    render(
      <RightSidePanelProvider>
        <RightSidePanelTrigger asChild>
          <a href="#x" data-testid="trigger">
            Open
          </a>
        </RightSidePanelTrigger>
      </RightSidePanelProvider>,
    );
    const link = screen.getByTestId("trigger");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("aria-label");
    expect(link).toHaveAttribute("aria-controls");
  });
});

describe("RightSidePanel (content render prop)", () => {
  it("renders a fully custom panel when content is provided", async () => {
    render(
      <RightSidePanelProvider defaultOpen>
        <RightSidePanel
          content={({ close }) => (
            <div>
              <span>custom body</span>
              <button onClick={close}>dismiss</button>
            </div>
          )}
        />
      </RightSidePanelProvider>,
    );
    expect(screen.getByText("custom body")).toBeInTheDocument();
    fireEvent.click(screen.getByText("dismiss"));
    await waitFor(() =>
      expect(screen.queryByText("custom body")).not.toBeInTheDocument(),
    );
  });
});

describe("RightSidePanel (non-modal outside click)", () => {
  it("does not close the panel when clicking outside of it", async () => {
    render(
      <>
        <button data-testid="outside">outside</button>
        <Probe defaultOpen />
      </>,
    );
    expect(screen.getByText("Assistant")).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByTestId("outside"));
    await waitFor(() =>
      expect(screen.getByText("Assistant")).toBeInTheDocument(),
    );
  });
});

describe("RightSidePanel (resize drag)", () => {
  it("renders the resize handle when resizable is true", () => {
    render(<Probe defaultOpen resizable />);
    const handle = document.querySelector<HTMLElement>("[data-resize-handle]");
    expect(handle).toBeInTheDocument();
    expect(handle).toHaveAttribute("role", "separator");
    expect(handle).toHaveAttribute("aria-orientation", "vertical");
    expect(handle).toHaveAttribute("aria-label", "Resize panel");
  });

  it("does not render a resize handle when resizable is false", () => {
    render(<Probe defaultOpen />);
    const handle = document.querySelector<HTMLElement>("[data-resize-handle]");
    expect(handle).not.toBeInTheDocument();
  });

  it("uses a CSS variable fallback chain so the live width reaches the panel", () => {
    render(<Probe defaultOpen resizable width="24rem" />);
    const panel = document.querySelector<HTMLElement>(
      '[data-slot="right-side-panel"]',
    );
    expect(panel).toBeInTheDocument();
    const style = panel!.getAttribute("style") ?? "";
    // The panel's width must reference the provider's live width var so
    // that pointermove updates the panel width in real time (the original
    // implementation only wrote the resolved width on pointerup, so the
    // panel never visually changed during a drag).
    expect(style).toMatch(/--right-side-panel-width/);
  });
});
