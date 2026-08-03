import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  AgentPanel,
  AgentPanelBody,
  AgentPanelClose,
  AgentPanelDescription,
  AgentPanelFooter,
  AgentPanelHeader,
  AgentPanelProvider,
  AgentPanelTitle,
  AgentPanelTrigger,
} from "./index";

function Probe({
  defaultOpen,
  open,
  onOpenChange,
  syncHash,
  shortcut,
  width,
}: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  syncHash?: boolean;
  shortcut?: false | string;
  width?: number | string;
}) {
  return (
    <AgentPanelProvider
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      syncHash={syncHash}
      shortcut={shortcut}
      width={width}
    >
      <AgentPanelTrigger ariaLabel="Open assistant" />
      <AgentPanel ariaLabel="Assistant">
        <AgentPanelHeader>
          <AgentPanelTitle>Assistant</AgentPanelTitle>
          <AgentPanelDescription>Ask anything</AgentPanelDescription>
          <AgentPanelClose />
        </AgentPanelHeader>
        <AgentPanelBody>Body content</AgentPanelBody>
        <AgentPanelFooter>Footer content</AgentPanelFooter>
      </AgentPanel>
    </AgentPanelProvider>
  );
}

describe("AgentPanelProvider", () => {
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

  it("writes #agent to the location hash when syncHash is enabled", async () => {
    render(<Probe syncHash />);
    fireEvent.click(screen.getByRole("button", { name: /open assistant/i }));
    await waitFor(() => expect(window.location.hash).toBe("#agent"));
  });

  it("does not write to the hash when syncHash is false", async () => {
    render(<Probe syncHash={false} />);
    fireEvent.click(screen.getByRole("button", { name: /open assistant/i }));
    expect(window.location.hash).toBe("");
  });

  it("opens when the URL already contains #agent on mount", async () => {
    window.history.replaceState(null, "", "#agent");
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

describe("AgentPanelTrigger (asChild)", () => {
  it("forwards onClick and aria attributes to the child element", () => {
    render(
      <AgentPanelProvider>
        <AgentPanelTrigger asChild>
          <a href="#x" data-testid="trigger">
            Open
          </a>
        </AgentPanelTrigger>
      </AgentPanelProvider>,
    );
    const link = screen.getByTestId("trigger");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("aria-label");
    expect(link).toHaveAttribute("aria-controls");
  });
});

describe("AgentPanel (content render prop)", () => {
  it("renders a fully custom panel when content is provided", async () => {
    render(
      <AgentPanelProvider defaultOpen>
        <AgentPanel
          content={({ close }) => (
            <div>
              <span>custom body</span>
              <button onClick={close}>dismiss</button>
            </div>
          )}
        />
      </AgentPanelProvider>,
    );
    expect(screen.getByText("custom body")).toBeInTheDocument();
    fireEvent.click(screen.getByText("dismiss"));
    await waitFor(() =>
      expect(screen.queryByText("custom body")).not.toBeInTheDocument(),
    );
  });
});
