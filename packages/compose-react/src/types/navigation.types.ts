export interface NavigationMenuItem {
  id: string;
  name: string;
  path?: string;
  icon?: unknown;
  children?: NavigationMenuItem[];
  type?: "menu" | "separator";
}

export interface NavigationMenuSeparator {
  id: string;
  type: "separator";
}

/** App-level pages that exist at the same path in every Blocks app. */
export type ForwardToStaticPath =
  | "/app/console"
  | "/app/dashboard"
  | "/app/profile"
  | "/app/project/environments"
  | "/app/create-project";

/**
 * A project-scoped landing path, e.g. `/app/<itemId>/dashboard`. Every Blocks
 * app exposes the active project's dashboard at this shape, so it is the safe
 * target when forwarding between apps while keeping the selected project.
 */
export type ForwardToScopedPath = `/app/${string}/dashboard`;

export type ForwardToPaths = ForwardToStaticPath | ForwardToScopedPath;

export type NavigationNode = NavigationMenuItem | NavigationMenuSeparator;
