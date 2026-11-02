import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyTheme } from "./theme";

type StartViewTransition = (update: () => void) => {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
};

// jsdom has no View Transitions API, so each case installs the behaviour it needs.
const installViewTransitions = (impl: StartViewTransition) => {
  const startViewTransition = vi.fn(impl);
  Object.defineProperty(document, "startViewTransition", {
    configurable: true,
    writable: true,
    value: startViewTransition,
  });
  return startViewTransition;
};

const setVisibility = (state: DocumentVisibilityState) =>
  vi.spyOn(document, "visibilityState", "get").mockReturnValue(state);

// Worst case: the update still runs, then every promise the transition exposes rejects. A real skip
// or abort rejects only `ready` (see `skippedTransition`); the other two reject if the update throws.
const rejectingTransition =
  (reason: () => unknown): StartViewTransition =>
  (update) => {
    const updated = Promise.resolve().then(update);
    const rejectAfterUpdate = () =>
      updated.then(() => Promise.reject(reason()));
    return {
      ready: Promise.reject(reason()),
      finished: rejectAfterUpdate(),
      updateCallbackDone: rejectAfterUpdate(),
    };
  };

// What the View Transitions spec does on a skip: the update runs and only `ready` rejects.
const skippedTransition =
  (reason: () => unknown): StartViewTransition =>
  (update) => {
    const updated = Promise.resolve().then(update);
    return {
      ready: Promise.reject(reason()),
      finished: updated,
      updateCallbackDone: updated,
    };
  };

const isDark = () => document.documentElement.classList.contains("dark");

// Long enough for Node to raise `unhandledRejection` for anything left without a handler.
const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

describe("applyTheme", () => {
  const unhandled = vi.fn();

  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    process.on("unhandledRejection", unhandled);
  });

  afterEach(() => {
    process.off("unhandledRejection", unhandled);
    unhandled.mockReset();
    Reflect.deleteProperty(document, "startViewTransition");
    vi.restoreAllMocks();
  });

  // H6
  it("animates a visible change and handles every rejection the transition can raise", async () => {
    setVisibility("visible");
    const start = installViewTransitions(
      rejectingTransition(
        () =>
          new DOMException(
            "Transition was aborted because of invalid state. Document hidden",
            "InvalidStateError",
          ),
      ),
    );

    applyTheme("dark");
    await settle();

    expect(start).toHaveBeenCalledTimes(1);
    expect(isDark()).toBe(true);
    expect(unhandled).not.toHaveBeenCalled();
  });

  it("handles a skipped transition, which rejects only `ready`", async () => {
    setVisibility("visible");
    installViewTransitions(
      skippedTransition(
        () =>
          new DOMException(
            "Transition was skipped because the viewport size changed.",
            "InvalidStateError",
          ),
      ),
    );

    applyTheme("dark");
    await settle();

    expect(isDark()).toBe(true);
    expect(unhandled).not.toHaveBeenCalled();
  });

  // C6, §7 #8
  it.each(["dark", "light"] as const)(
    "switches to %s instantly, without a transition, while the page is hidden",
    (theme) => {
      document.documentElement.classList.toggle("dark", theme !== "dark");
      setVisibility("hidden");
      const start = installViewTransitions(() => {
        throw new Error("must not start a transition");
      });

      applyTheme(theme);

      expect(start).not.toHaveBeenCalled();
      expect(isDark()).toBe(theme === "dark");
    },
  );

  it.each(["dark", "light"] as const)(
    "switches to %s instantly where the API is missing",
    (theme) => {
      document.documentElement.classList.toggle("dark", theme !== "dark");
      setVisibility("visible");
      expect(document.startViewTransition).toBeUndefined();

      applyTheme(theme);

      expect(isDark()).toBe(theme === "dark");
    },
  );

  // C7: rapid toggles abort the earlier transitions, and the last theme still wins.
  it("ends on the latest theme when transitions are aborted", async () => {
    setVisibility("visible");
    installViewTransitions(
      rejectingTransition(
        () =>
          new DOMException(
            "Old view transition aborted by new view transition.",
            "AbortError",
          ),
      ),
    );

    applyTheme("dark");
    applyTheme("light");
    applyTheme("dark");
    await settle();

    expect(isDark()).toBe(true);
    expect(unhandled).not.toHaveBeenCalled();
  });
});
