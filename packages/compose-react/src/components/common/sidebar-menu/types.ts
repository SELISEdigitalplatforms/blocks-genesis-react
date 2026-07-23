import type { Menu } from "@/types";

export type RedirectPaths = Record<string, string>;

export type SideBarMenuProps = {
  redirectPaths: RedirectPaths;
  navigationMenus: Menu[];
};
