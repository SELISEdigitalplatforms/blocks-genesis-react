import type { RedirectPaths } from "@/components";
import type { ForwardToPaths, Menu } from "@/types";

export type LayoutProps = {
  redirectPaths: RedirectPaths;
  navigationMenus: Menu[];
  forwardedTo?: ForwardToPaths;
};
