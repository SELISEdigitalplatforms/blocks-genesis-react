export type Theme = "light" | "dark" | "system";

export function getSystemTheme(): Exclude<Theme, "system"> {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(resolvedTheme: Exclude<Theme, "system">) {
  const root = document.documentElement;
  const apply = () => root.classList.toggle("dark", resolvedTheme === "dark");

  // A hidden document cannot run a view transition: the browser skips it and rejects its promises
  // with `InvalidStateError`, so switch instantly instead.
  if (!document.startViewTransition || document.visibilityState === "hidden") {
    apply();
    return;
  }

  // The animation is cosmetic. When the browser skips or aborts a transition (a newer one started,
  // the viewport changed) it still runs `apply` and rejects `ready`; `finished` and
  // `updateCallbackDone` reject if `apply` throws. Each rejection without a handler became an
  // unhandled rejection reported to Rollbar, so all three are handled.
  const transition = document.startViewTransition(apply);
  const ignore = () => undefined;
  transition.ready.catch(ignore);
  transition.finished.catch(ignore);
  transition.updateCallbackDone.catch(ignore);
}
