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

export type NavigationNode = NavigationMenuItem | NavigationMenuSeparator;
