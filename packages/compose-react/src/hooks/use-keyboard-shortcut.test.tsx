import { describe, it, expect, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { useKeyboardShortcut } from "./use-keyboard-shortcut";

function Probe({
  combo,
  onFire,
  allowInEditable,
}: {
  combo: Parameters<typeof useKeyboardShortcut>[0];
  onFire: () => void;
  allowInEditable?: boolean;
}) {
  useKeyboardShortcut(combo, onFire, { allowInEditable });
  return null;
}

function press(key: string, init: KeyboardEventInit = {}) {
  fireEvent.keyDown(document, { key, ...init });
}

describe("useKeyboardShortcut", () => {
  it("invokes handler when combo matches", () => {
    const handler = vi.fn();
    render(<Probe combo="mod+j" onFire={handler} />);
    press("j", { ctrlKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not invoke when modifiers differ", () => {
    const handler = vi.fn();
    render(<Probe combo="mod+j" onFire={handler} />);
    press("j", { metaKey: true });
    expect(handler).not.toHaveBeenCalled();
  });

  it("does not invoke when key differs", () => {
    const handler = vi.fn();
    render(<Probe combo="mod+j" onFire={handler} />);
    press("k", { ctrlKey: true });
    expect(handler).not.toHaveBeenCalled();
  });

  it("does nothing when combo is false", () => {
    const handler = vi.fn();
    render(<Probe combo={false} onFire={handler} />);
    press("j", { ctrlKey: true });
    expect(handler).not.toHaveBeenCalled();
  });

  it("ignores key events inside an input by default", () => {
    const handler = vi.fn();
    const { getByRole } = render(
      <>
        <input data-testid="text" />
        <Probe combo="mod+j" onFire={handler} />
      </>,
    );
    const input = getByRole("textbox");
    fireEvent.keyDown(input, { key: "j", ctrlKey: true });
    expect(handler).not.toHaveBeenCalled();
  });

  it("honors allowInEditable", () => {
    const handler = vi.fn();
    const { getByRole } = render(
      <>
        <input data-testid="text" />
        <Probe combo="mod+j" onFire={handler} allowInEditable />
      </>,
    );
    fireEvent.keyDown(getByRole("textbox"), { key: "j", ctrlKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
