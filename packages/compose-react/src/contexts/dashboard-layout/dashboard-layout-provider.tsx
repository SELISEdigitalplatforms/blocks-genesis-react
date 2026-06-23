import { useIsActiveMenu } from "@/hooks/use-menus";
import { useIsMobile } from "@/hooks/use-mobile";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SidebarContext } from "./sidebar.context";

// Below this width (but above the mobile breakpoint handled by
// useIsMobile), the sidebar auto-collapses to icon-only. At/above it,
// it restores whatever the user last manually chose.
const SIDEBAR_COLLAPSE_BREAKPOINT = 1024;
const RESIZE_DEBOUNCE_MS = 150;

export function DashboardLayoutProvider({
  children,
  isOpen,
  isSubMenuOpen = false,
  storageKey = "sidebar-open",
  persist = false,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  isSubMenuOpen?: boolean;
  storageKey?: string;
  persist?: boolean;
}) {
  const { isActivePath: isServicesPath } = useIsActiveMenu("/app/services");
  const isMobile = useIsMobile();
  const isMountedRef = useRef(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(isOpen);
  const [isSidebarSubMenuOpen, setIsSidebarSubMenuOpen] =
    useState(isSubMenuOpen);
  const [subMenuId, setSubMenuId] = useState<string | null>(null);
  const [servicesSearchTerm, setServicesSearchTerm] = useState("");

  // The user's last *manual* open/closed choice (toggle, persisted load),
  // kept separate from the live isSidebarOpen value so tablet-width
  // auto-collapse can be purely visual and reversible.
  const manualSidebarOpenRef = useRef(isOpen);
  // "desktop" | "tablet" classification as of the last time this was
  // computed while non-mobile. null forces a fresh evaluation next time
  // (used when coming back from mobile, where width may have jumped any
  // amount).
  const previousRangeRef = useRef<"desktop" | "tablet" | null>(null);

  useEffect(() => {
    if (persist && !isMountedRef.current) {
      isMountedRef.current = true;
      if (!isMobile) {
        const stored = localStorage.getItem(storageKey);
        if (stored !== null) {
          const storedOpen = JSON.parse(stored) as boolean;
          manualSidebarOpenRef.current = storedOpen;
          setIsSidebarOpen(storedOpen);
          return;
        }
      } else {
        setIsSidebarOpen(false);
      }
    }
  }, [isMobile, persist, storageKey]);

  useEffect(() => {
    if (!persist) {
      setIsSidebarOpen(!isMobile);
    } else if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile, persist]);

  // Tablet-width auto-collapse. Only reacts to actually crossing the
  // breakpoint, not every resize tick, so a manual toggle while inside a
  // given range sticks until the range changes again.
  useEffect(() => {
    if (isMobile) {
      previousRangeRef.current = null;
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

      setIsSidebarOpen(
        currentRange === "tablet" ? false : manualSidebarOpenRef.current,
      );
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
    setIsSidebarOpen((prev) => {
      const nextState = !prev;
      manualSidebarOpenRef.current = nextState;
      if (persist && !isMobile) {
        localStorage.setItem(storageKey, JSON.stringify(nextState));
      }
      if (nextState) {
        setIsSidebarSubMenuOpen(false);
      }
      return nextState;
    });
  }, [isMobile, persist, storageKey]);

  const closeSidebar = useCallback(() => {
    manualSidebarOpenRef.current = false;
    setIsSidebarOpen(false);
    if (persist && !isMobile) {
      localStorage.setItem(storageKey, JSON.stringify(false));
    }
  }, [isMobile, persist, storageKey]);

  const closeWithoutPersist = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

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

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        toggleSidebar,
        closeSidebar,
        closeWithoutPersist,
        isSidebarSubMenuOpen,
        toggleSidebarSubMenu,
        showSidebarSubMenu,
        subMenuId,
        updateSubMenuId,
        servicesSearchTerm,
        updateServicesSearchTerm,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
