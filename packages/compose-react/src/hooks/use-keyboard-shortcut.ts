import { useEffect } from "react";

export type KeyboardShortcutCombo = string | false;

type ParsedCombo = {
  key: string;
  mod: boolean;
  shift: boolean;
  alt: boolean;
};

const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (EDITABLE_TAGS.has(target.tagName)) {
    const type = (target as HTMLInputElement).type;
    return type !== "checkbox" && type !== "radio" && type !== "button";
  }
  return false;
}

function parseCombo(combo: string): ParsedCombo {
  const parts = combo
    .toLowerCase()
    .split("+")
    .map((p) => p.trim())
    .filter(Boolean);
  const parsed: ParsedCombo = {
    key: "",
    mod: false,
    shift: false,
    alt: false,
  };
  for (const part of parts) {
    if (
      part === "mod" ||
      part === "cmd" ||
      part === "ctrl" ||
      part === "meta"
    ) {
      parsed.mod = true;
    } else if (part === "shift") {
      parsed.shift = true;
    } else if (part === "alt" || part === "option") {
      parsed.alt = true;
    } else {
      parsed.key = part;
    }
  }
  return parsed;
}

function matchesCombo(parsed: ParsedCombo, event: KeyboardEvent): boolean {
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modPressed = isMac ? event.metaKey : event.ctrlKey;
  if (parsed.mod !== modPressed) return false;
  if (parsed.shift !== event.shiftKey) return false;
  if (parsed.alt !== event.altKey) return false;
  return event.key.toLowerCase() === parsed.key;
}

/**
 * Bind a keyboard combo to a handler at the document level.
 *
 * - `combo` follows the `"mod+." | "ctrl+shift+k" | "escape" | false` syntax.
 *   `mod` resolves to `Cmd` on macOS and `Ctrl` elsewhere. Pass `false` to
 *   disable the listener entirely.
 * - The handler is suppressed when focus is inside an editable element
 *   (input, textarea, contenteditable) unless `allowInEditable` is set.
 * - `event.preventDefault()` is called when a match fires, so the browser
 *   does not also handle the shortcut (e.g. open the find bar).
 */
export function useKeyboardShortcut(
  combo: KeyboardShortcutCombo,
  handler: (event: KeyboardEvent) => void,
  options: { allowInEditable?: boolean } = {},
): void {
  const { allowInEditable = false } = options;

  useEffect(() => {
    if (!combo) return;
    const parsed = parseCombo(combo);

    const onKeyDown = (event: KeyboardEvent) => {
      if (!allowInEditable && isEditableTarget(event.target)) return;
      if (!matchesCombo(parsed, event)) return;
      event.preventDefault();
      handler(event);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [combo, handler, allowInEditable]);
}
