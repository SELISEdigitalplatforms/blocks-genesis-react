import { useMemo, isValidElement, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components";
import type { Menu } from "@/types";

type MenuItemType = Extract<Menu, { type: "menu" }>;

function renderIcon(icon: MenuItemType["icon"], className: string) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  const IconComponent = icon as React.ComponentType<{ className?: string }>;
  return <IconComponent className={className} />;
}

function ChildMenuItem({ menu }: { menu: MenuItemType }) {
  const { pathname } = useLocation();
  const isActiveMenu = pathname.startsWith(menu.path);

  return (
    <Link
      to={menu.path}
      className={cn(
        "flex h-10 items-center px-4 py-1.5 text-sm transition-colors hover:text-[hsl(var(--high-emphasis))]",
        isActiveMenu && "!text-primary",
        menu.disabled && "pointer-events-none cursor-not-allowed opacity-50",
      )}
    >
      {renderIcon(menu.icon, "mr-2 h-5 w-5")}
      <span>{menu.name}</span>
    </Link>
  );
}

export function DesktopMenuItem({
  menu,
  isSidebarOpen,
}: {
  menu: MenuItemType;
  isSidebarOpen: boolean;
}) {
  const { pathname } = useLocation();

  const isActiveMenu = useMemo(() => {
    const allPaths = [menu.path];
    if (menu.children) {
      menu.children.forEach((child) => {
        if (child.type === "menu") allPaths.push(child.path);
      });
    }
    return allPaths.some((item) => pathname.startsWith(item));
  }, [menu.children, menu.path, pathname]);

  // Auto-expand if a child route is currently active
  const hasActiveChild = useMemo(
    () =>
      menu.children?.some(
        (child) => child.type === "menu" && pathname.startsWith(child.path),
      ) ?? false,
    [menu.children, pathname],
  );

  const [isOpen, setIsOpen] = useState(hasActiveChild);

  const hasChildren = Boolean(menu.children?.length);

  const baseClasses = cn(
    "relative flex h-10 cursor-pointer items-center gap-3 px-4 py-1.5 text-base text-[hsl(var(--low-emphasis))] hover:text-[hsl(var(--high-emphasis))]",
    isActiveMenu && "!text-primary",
  );

  const filteredChildren = menu.children?.filter(
    (subMenu): subMenu is MenuItemType =>
      subMenu.type === "menu" && !subMenu.disabled,
  );

  if (!hasChildren) {
    return (
      <div className={cn(baseClasses, "group justify-between")}>
        <Link
          to={menu.path}
          className={cn(
            "flex items-center gap-3",
            menu.disabled && "pointer-events-none opacity-50",
          )}
        >
          {renderIcon(menu.icon, "h-5 w-5")}
          {isSidebarOpen ? (
            <span className="relative">
              {menu.name}
              {menu.badge ? (
                <Badge
                  variant="secondary"
                  className="absolute -top-2 left-full ml-1 h-4 px-1 text-[9px] font-semibold uppercase text-primary"
                >
                  {menu.badge}
                </Badge>
              ) : null}
            </span>
          ) : null}
        </Link>
        {!isSidebarOpen ? (
          <div className="pointer-events-none absolute left-full top-0 z-20 ml-2 min-w-max whitespace-nowrap rounded bg-gray-300 px-2 py-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
            {menu.name}
          </div>
        ) : null}
        {isActiveMenu ? (
          <div className="absolute right-0 top-2.5 h-5 w-1 rounded-lg bg-primary" />
        ) : null}
      </div>
    );
  }

  // Collapsed sidebar — keep hover flyout to the right (no chevron visible to click)
  if (!isSidebarOpen) {
    return (
      <div className={cn(baseClasses, "group")}>
        <div className="flex items-center gap-3">
          {renderIcon(menu.icon, "h-5 w-5")}
        </div>
        <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 rounded bg-gray-300 px-2 py-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
          <span className="whitespace-nowrap">{menu.name}</span>
        </div>
        {isActiveMenu ? (
          <div className="absolute right-0 top-2.5 h-5 w-1 rounded-lg bg-primary" />
        ) : null}
        <div className="absolute left-full top-0 z-10 hidden w-64 flex-col rounded-sm border bg-background py-2 group-hover:flex group-hover:text-[hsl(var(--low-emphasis))]">
          {filteredChildren?.map((subMenu) => (
            <ChildMenuItem key={subMenu.id} menu={subMenu} />
          ))}
        </div>
        <div className="absolute left-full top-0 hidden h-full w-1 bg-transparent group-hover:block" />
      </div>
    );
  }

  // Expanded sidebar — click-to-toggle accordion below the parent
  return (
    <div>
      <div
        className={cn(baseClasses, "justify-between")}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          {renderIcon(menu.icon, "h-5 w-5")}
          <span className="relative">
            {menu.name}
            {menu.badge ? (
              <Badge
                variant="outline"
                className="absolute -top-2 left-full ml-1 h-4 px-1 text-[9px] font-semibold uppercase text-primary"
              >
                {menu.badge}
              </Badge>
            ) : null}
          </span>
        </div>
        <ChevronRight
          className={cn(
            "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
        {isActiveMenu ? (
          <div className="absolute right-0 top-2.5 h-5 w-1 rounded-lg bg-primary" />
        ) : null}
      </div>

      {isOpen ? (
        <div className="ml-4 flex flex-col border-l border-border">
          {filteredChildren?.map((subMenu) => (
            <ChildMenuItem key={subMenu.id} menu={subMenu} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
