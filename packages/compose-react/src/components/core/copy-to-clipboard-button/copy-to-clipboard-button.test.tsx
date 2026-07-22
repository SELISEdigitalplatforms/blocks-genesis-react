import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CopyToClipboardButton } from "@/components/core/copy-to-clipboard-button/copy-to-clipboard-button";

describe("CopyToClipboardButton", () => {
  const originalClipboard = navigator.clipboard;
  const originalSecure = window.isSecureContext;
  const originalExec = document.execCommand;

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: originalClipboard,
    });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: originalSecure,
    });
    document.execCommand = originalExec;
  });

  it("falls back to execCommand and switches to copied after a click", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: false,
    });
    const execSpy = vi.fn(() => true);
    document.execCommand = execSpy as unknown as typeof document.execCommand;

    render(
      <CopyToClipboardButton textToCopy="hello" isHoverable>
        <span>Token</span>
      </CopyToClipboardButton>,
    );
    expect(screen.getByText("Token")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(
      await screen.findByRole("button", { name: "Copied!" }),
    ).toBeInTheDocument();
    expect(execSpy).toHaveBeenCalledWith("copy");
  });

  it("uses the clipboard API in a secure context", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });
    render(
      <CopyToClipboardButton textToCopy="secret">
        <span>Key</span>
      </CopyToClipboardButton>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(writeText).toHaveBeenCalledWith("secret");
  });
});
