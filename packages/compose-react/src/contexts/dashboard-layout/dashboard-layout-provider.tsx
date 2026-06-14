import useIsMobile from "@/hooks/use-is-mobile";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { SidebarContext } from "./sidebar.context";

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
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const isMountedRef = useRef(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(isOpen);
  const [isSidebarSubMenuOpen, setIsSidebarSubMenuOpen] =
    useState(isSubMenuOpen);
  const [subMenuId, setSubMenuId] = useState<string | null>(null);
  const [servicesSearchTerm, setServicesSearchTerm] = useState("");

  useEffect(() => {
    if (persist && !isMountedRef.current) {
      isMountedRef.current = true;
      if (!isMobile) {
        const stored = localStorage.getItem(storageKey);
        if (stored !== null) {
          setIsSidebarOpen(JSON.parse(stored) as boolean);
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

  useEffect(() => {
    const menuId = localStorage.getItem("subMenuId");
    if (menuId !== null) {
      setSubMenuId(menuId);
    }
  }, []);

  useEffect(() => {
    if (!isMobile && pathname.startsWith("/services")) {
      setIsSidebarSubMenuOpen(true);
    }
  }, [pathname, isMobile]);

  useEffect(() => {
    if (isSidebarOpen && !isMobile) {
      setIsSidebarSubMenuOpen(false);
    }
  }, [isSidebarOpen, isMobile]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      const nextState = !prev;
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
