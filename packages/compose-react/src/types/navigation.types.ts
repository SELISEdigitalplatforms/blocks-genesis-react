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

export type ForwardToPaths =
  | "/console"
  | "/dashboard"
  | "/profile"
  | "/project-overview/environments";

export type NavigationNode = NavigationMenuItem | NavigationMenuSeparator;
