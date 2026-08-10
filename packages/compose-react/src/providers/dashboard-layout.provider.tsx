import { SidebarContext } from "@/contexts";
import { useIsActiveMenu } from "@/hooks/use-menus";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLayoutSettingsStore } from "@/store/layout-settings.store";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Below this width (but above the mobile breakpoint handled by
// useIsMobile), the sidebar auto-collapses to icon-only. At/above it,
// it restores whatever the user last manually chose.
const SIDEBAR_COLLAPSE_BREAKPOINT = 1024;
const RESIZE_DEBOUNCE_MS = 150;

export function DashboardLayoutProvider({
  children,
  isOpen,
  isSubMenuOpen = false,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  isSubMenuOpen?: boolean;
}) {
  const { isActivePath: isServicesPath } = useIsActiveMenu("/app/services");
  const isMobile = useIsMobile();
  const { layout, setLayoutSetting } = useLayoutSettingsStore();
  const isLeftSidebarOpen = layout.isLeftSidebarOpen;

  const [isSidebarSubMenuOpen, setIsSidebarSubMenuOpen] =
    useState(isSubMenuOpen);
  const [subMenuId, setSubMenuId] = useState<string | null>(null);
  const [servicesSearchTerm, setServicesSearchTerm] = useState("");

  // Desktop ↔ tablet classification as of the last time this was computed
  // while non-mobile. null forces a fresh evaluation next time (used when
  // coming back from mobile, where width may have jumped any amount).
  const previousRangeRef = useRef<"desktop" | "tablet" | null>(null);
  const [isTablet, setIsTablet] = useState(false);

  // Seed the store from the isOpen prop on first mount, when the store
  // has no preference yet. Subsequent isOpen prop changes are ignored
  // (matches the original useState(isOpen) semantics).
  useEffect(() => {
    if (isLeftSidebarOpen === undefined) {
      setLayoutSetting("isLeftSidebarOpen", isOpen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live state: respect the user's manual preference on desktop, but
  // force-closed on tablet (auto-collapse) and mobile.
  const isSidebarOpen = !isMobile && !isTablet && (isLeftSidebarOpen ?? isOpen);

  // Tablet-width auto-collapse. Only reacts to actually crossing the
  // breakpoint, not every resize tick, so a manual toggle while inside a
  // given range sticks until the range changes again.
  useEffect(() => {
    if (isMobile) {
      previousRangeRef.current = null;
      setIsTablet(false);
      return;
    }

    let debounceTimer: ReturnType<typeof setTimeout>;

    const syncToViewport = () => {
      const currentRange: "desktop" | "tablet" =
        window.innerWidth < SIDEBAR_COLLAPSE_BREAKPOINT ? "tablet" : "desktop";

      if (previousRangeRef.current === currentRange) {
        return;
      }
      previousRangeRef.current = currentRange;

      setIsTablet(currentRange === "tablet");
    };

    const handleResize = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(syncToViewport, RESIZE_DEBOUNCE_MS);
    };

    syncToViewport();
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  useEffect(() => {
    const menuId = localStorage.getItem("subMenuId");
    if (menuId !== null) {
      setSubMenuId(menuId);
    }
  }, []);

  useEffect(() => {
    if (!isMobile && isServicesPath) {
      setIsSidebarSubMenuOpen(true);
    }
  }, [isServicesPath, isMobile]);

  useEffect(() => {
    if (isSidebarOpen && !isMobile) {
      setIsSidebarSubMenuOpen(false);
    }
  }, [isSidebarOpen, isMobile]);

  const toggleSidebar = useCallback(() => {
    setLayoutSetting("isLeftSidebarOpen", !(isLeftSidebarOpen ?? isOpen));
    setIsSidebarSubMenuOpen(false);
  }, [isLeftSidebarOpen, isOpen, setLayoutSetting]);

  const closeSidebar = useCallback(() => {
    setLayoutSetting("isLeftSidebarOpen", false);
  }, [setLayoutSetting]);

  const toggleSidebarSubMenu = useCallback(() => {
    setIsSidebarSubMenuOpen((prev) => !prev);
  }, []);

  const showSidebarSubMenu = useCallback(() => {
    setIsSidebarSubMenuOpen(true);
  }, []);

  const updateSubMenuId = useCallback((id: string) => {
    localStorage.setItem("subMenuId", id);
    setSubMenuId(id);
    setServicesSearchTerm("");
  }, []);

  const updateServicesSearchTerm = useCallback((term: string) => {
    setServicesSearchTerm(term);
  }, []);

  const contextValue = React.useMemo(
    () => ({
      isSidebarOpen,
      toggleSidebar,
      closeSidebar,
      isSidebarSubMenuOpen,
      toggleSidebarSubMenu,
      showSidebarSubMenu,
      subMenuId,
      updateSubMenuId,
      servicesSearchTerm,
      updateServicesSearchTerm,
    }),
    [
      isSidebarOpen,
      toggleSidebar,
      closeSidebar,
      isSidebarSubMenuOpen,
      toggleSidebarSubMenu,
      showSidebarSubMenu,
      subMenuId,
      updateSubMenuId,
      servicesSearchTerm,
      updateServicesSearchTerm,
    ],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}
