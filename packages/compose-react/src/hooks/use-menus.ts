import type { Menu } from "@/types";
import { useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";

const projectOverviewMenuIds = new Set([
  "environments",
  "people",
  "repositories",
  "settings",
  "subscription-usage",
]);

export function useFilteredMenus(menus: Menu[]): Menu[] {
  const { isActivePath: isProjectOverviewRoute } = useIsActiveMenu(
    "/app/project-overview",
  );

  return useMemo(() => {
    const blockedMenu = import.meta.env.BLOCKS_BLOCKED_MENU || "[]";
    let parsedBlockedMenu: string[] = [];

    try {
      parsedBlockedMenu = JSON.parse(blockedMenu) as string[];
    } catch (error) {
      console.error("Failed to parse BLOCKS_BLOCKED_MENU:", error);
    }

    const filteredMenus = menus.filter((item) => {
      if (item.type === "separator") return true;
      if (item.disabled) return false;
      if (!isProjectOverviewRoute && projectOverviewMenuIds.has(item.id))
        return false;
      if (isProjectOverviewRoute && !projectOverviewMenuIds.has(item.id))
        return false;
      return !parsedBlockedMenu.includes(item.id);
    });

    return filteredMenus.filter((item, index) => {
      if (item.type !== "separator") return true;

      const previousItem = filteredMenus[index - 1];
      const nextItem = filteredMenus[index + 1];
      const separatorId = item.id;

      if (separatorId === "separator-overview" && isProjectOverviewRoute) {
        return false;
      }
      if (
        separatorId === "separator-overview" &&
        previousItem?.type !== "separator" &&
        !isProjectOverviewRoute
      ) {
        return true;
      }
      if (!previousItem || !nextItem) return false;
      if (previousItem.type === "separator" || nextItem.type === "separator")
        return false;

      return true;
    });
  }, [menus, isProjectOverviewRoute]);
}

export function useIsActiveMenu(path: string) {
  const { pathname } = useLocation();

  const checkIsActivePath = useCallback(
    (candidatePath: string) => pathname.startsWith(candidatePath),
    [pathname],
  );

  return { isActivePath: checkIsActivePath(path), checkIsActivePath };
}
