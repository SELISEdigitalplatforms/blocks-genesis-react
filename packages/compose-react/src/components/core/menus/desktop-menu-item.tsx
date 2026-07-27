import {
  Badge,
  RenderConditionally,
  SidebarCollapsedTooltip,
} from "@/components";
import { useIsActiveMenu } from "@/hooks/use-menus";
import { cn } from "@/lib/utils";
import type { Menu } from "@/types";
import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

type MenuItemType = Extract<Menu, { type: "menu" }>;

const parentClasses = (isSidebarOpen: boolean, isActive: boolean) =>
  cn(
    "group relative flex h-10 w-full cursor-pointer items-center gap-3 p-1.5 text-base text-[hsl(var(--low-emphasis))] hover:text-[hsl(var(--high-emphasis))]",
    isSidebarOpen ? "px-4" : "justify-center px-0",
    isActive && "!text-primary",
  );

const childClasses = (isSidebarOpen: boolean, isActive: boolean) =>
  cn(
    "group relative flex h-10 w-full items-center gap-2 text-base transition-colors",
    isSidebarOpen ? "px-4 pl-8" : "justify-center px-4",
    isActive
      ? "!text-primary"
      : "text-[hsl(var(--low-emphasis))] hover:text-[hsl(var(--high-emphasis))]",
  );

type ChildMenuItemProps = {
  menu: MenuItemType;
  isSidebarOpen: boolean;
};

const ActiveBadge = () => (
  <div className="absolute right-0 top-2.5 h-5 w-1 rounded-lg bg-primary" />
);

const ChildMenuItem = ({ menu, isSidebarOpen }: ChildMenuItemProps) => {
  const { isActivePath: isActiveMenu } = useIsActiveMenu(menu.path);

  return (
    <SidebarCollapsedTooltip label={menu.name} show={!isSidebarOpen}>
      <Link
        to={menu.path}
        className={cn(
          childClasses(isSidebarOpen, isActiveMenu),
          menu.disabled && "pointer-events-none cursor-not-allowed opacity-50",
        )}
      >
        {menu.icon ? <menu.icon className="h-5 w-5 shrink-0" /> : null}
        {isSidebarOpen ? <span>{menu.name}</span> : null}
        {isActiveMenu ? (
          <div className="absolute right-0 top-2.5 h-5 w-1 rounded-lg bg-primary" />
        ) : null}
      </Link>
    </SidebarCollapsedTooltip>
  );
};

function DesktopLeafMenuItem({
  menu,
  isSidebarOpen,
  isActiveMenu,
}: {
  menu: MenuItemType;
  isSidebarOpen: boolean;
  isActiveMenu: boolean;
}) {
  return (
    <SidebarCollapsedTooltip label={menu.name} show={!isSidebarOpen}>
      <div className={parentClasses(isSidebarOpen, isActiveMenu)}>
        <Link
          to={menu.path}
          className={cn(
            "flex items-center gap-3",
            !isSidebarOpen && "justify-center",
            menu.disabled && "pointer-events-none opacity-50",
          )}
        >
          {menu.icon ? <menu.icon className="h-5 w-5 shrink-0" /> : null}
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
        {isActiveMenu ? (
          <div className="absolute right-0 top-2.5 h-5 w-1 rounded-lg bg-primary" />
        ) : null}
      </div>
    </SidebarCollapsedTooltip>
  );
}

export function DesktopMenuItem({
  menu,
  isSidebarOpen,
}: {
  menu: MenuItemType;
  isSidebarOpen: boolean;
}) {
  const navigate = useNavigate();
  const { checkIsActivePath } = useIsActiveMenu(menu.path);

  const filteredChildren = useMemo(
    () =>
      menu.children?.filter(
        (subMenu: Menu): subMenu is MenuItemType =>
          subMenu.type === "menu" && !subMenu.disabled,
      ) ?? [],
    [menu.children],
  );

  const hasChildren = filteredChildren.length > 0;

  const hasActiveChild = useMemo(
    () => filteredChildren.some((child) => checkIsActivePath(child.path)),
    [filteredChildren, checkIsActivePath],
  );

  const isActiveMenu = useMemo(() => {
    const allPaths = [
      menu.path,
      ...filteredChildren.map((child) => child.path),
    ];
    return allPaths.some((item) => checkIsActivePath(item));
  }, [filteredChildren, menu.path, checkIsActivePath]);

  const [isOpen, setIsOpen] = useState(hasActiveChild);

  useEffect(() => {
    setIsOpen(hasActiveChild);
  }, [hasActiveChild]);

  const handleParentClick = () => {
    // Already somewhere inside this menu's own path or one of its
    // children — just toggle the list, don't yank the user to a
    // different child.
    if (isActiveMenu) {
      setIsOpen((prev) => !prev);
      return;
    }

    // Coming from outside this section entirely — jump straight to the
    // first child, same as the index→Navigate fallback your router
    // already does for /services/secret-management, /authentication, /lmt.
    const firstChild = filteredChildren[0];
    if (firstChild) {
      navigate(firstChild.path);
    }
    setIsOpen(true);
  };

  if (menu.type !== "menu") {
    return null;
  }

  if (!hasChildren) {
    return (
      <DesktopLeafMenuItem
        menu={menu}
        isSidebarOpen={isSidebarOpen}
        isActiveMenu={isActiveMenu}
      />
    );
  }

  return (
    <div>
      <SidebarCollapsedTooltip label={menu.name} show={!isSidebarOpen}>
        <button
          type="button"
          onClick={handleParentClick}
          className={parentClasses(isSidebarOpen, isActiveMenu)}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              !isSidebarOpen && "w-full justify-center",
            )}
          >
            {menu.icon ? <menu.icon className="h-5 w-5 shrink-0" /> : null}
            <RenderConditionally condition={isSidebarOpen}>
              <span className="relative">
                {menu.name}
                <RenderConditionally condition={!!menu.badge}>
                  <Badge
                    variant="outline"
                    className="absolute -top-2 left-full ml-1 h-4 px-1 text-[9px] font-semibold uppercase text-primary"
                  >
                    {menu.badge}
                  </Badge>
                </RenderConditionally>
              </span>
            </RenderConditionally>
          </div>
          <RenderConditionally condition={isSidebarOpen}>
            <ChevronRight
              className={cn(
                "ml-auto h-4 w-4 transition-transform",
                isOpen && "rotate-90",
              )}
            />
          </RenderConditionally>

          <RenderConditionally condition={isActiveMenu}>
            <ActiveBadge />
          </RenderConditionally>
        </button>
      </SidebarCollapsedTooltip>

      {isOpen ? (
        <div className="grid gap-0.5">
          {filteredChildren.map((subMenu) => (
            <ChildMenuItem
              key={subMenu.id}
              menu={subMenu}
              isSidebarOpen={isSidebarOpen}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
