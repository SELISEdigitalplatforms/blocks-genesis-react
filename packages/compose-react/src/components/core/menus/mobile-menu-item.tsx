import {
  Badge,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components";
import { useIsActiveMenu } from "@/hooks/use-menus";
import { cn } from "@/lib/utils";
import type { Menu } from "@/types";
import { ChevronRight, X } from "lucide-react";
import { isValidElement, useMemo } from "react";
import { Link } from "react-router";

type MenuItemType = Extract<Menu, { type: "menu" }>;

function renderIcon(icon: MenuItemType["icon"], className: string) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  const IconComponent = icon as React.ComponentType<{ className?: string }>;
  return <IconComponent className={className} />;
}

function ChildMenuItem({
  menu,
  onClick,
}: {
  menu: MenuItemType;
  onClick?: () => void;
}) {
  const isActiveMenu = useIsActiveMenu(menu.path);

  return (
    <Link
      to={menu.path}
      className={cn(
        "flex h-10 items-center py-1.5 text-base transition-colors hover:text-primary",
        isActiveMenu && "text-primary",
        menu.disabled && "pointer-events-none cursor-not-allowed opacity-50",
      )}
      onClick={onClick}
    >
      {renderIcon(menu.icon, "mr-2 h-5 w-5")}
      <span>{menu.name}</span>
    </Link>
  );
}

export function MobileMenuItem({
  menu,
  onClick,
}: {
  menu: MenuItemType;
  onClick?: () => void;
}) {
  const { checkIsActivePath } = useIsActiveMenu(menu.path);

  const isActiveMenu = useMemo(() => {
    const allPaths = [menu.path];
    if (menu.children) {
      menu.children.forEach((child) => {
        if (child.type === "menu") allPaths.push(child.path);
      });
    }
    return allPaths.some((item) => checkIsActivePath(item));
  }, [menu.children, menu.path, checkIsActivePath]);

  const hasChildren = Boolean(menu.children?.length);

  if (!hasChildren) {
    return (
      <div
        className={cn(
          "flex h-10 items-center justify-between px-4 py-1.5 text-base text-[hsl(var(--low-emphasis))] hover:text-[hsl(var(--high-emphasis))]",
          isActiveMenu && "!text-primary",
        )}
      >
        <Link
          to={menu.path}
          className={cn(
            "flex items-center gap-3",
            menu.disabled && "pointer-events-none opacity-50",
          )}
          onClick={onClick}
        >
          {renderIcon(menu.icon, "h-5 w-5")}
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
        </Link>
      </div>
    );
  }

  return (
    <Sheet>
      <SheetTrigger>
        <div
          className={cn(
            "flex h-10 items-center justify-between px-4 py-1.5 text-base text-[hsl(var(--low-emphasis))] hover:text-[hsl(var(--high-emphasis))]",
            isActiveMenu && "!text-primary",
          )}
        >
          <div className="flex items-center gap-3">
            {renderIcon(menu.icon, "h-5 w-5")}
            <span className="relative">{menu.name}</span>
          </div>
          <ChevronRight className="aspect-square w-4" />
        </div>
      </SheetTrigger>
      <SheetContent
        className="w-full p-0"
        aria-describedby={undefined}
        hideClose
      >
        <SheetHeader className="flex-row items-center justify-between px-4 py-3">
          <SheetTitle>{menu.name}</SheetTitle>
          <SheetClose className="!mt-0">
            <X className="h-4 w-4" />
          </SheetClose>
        </SheetHeader>
        <Separator />
        <div className="mt-4 px-4">
          {menu.children
            ?.filter(
              (item): item is MenuItemType =>
                item.type === "menu" && !item.disabled,
            )
            .map((child) => (
              <ChildMenuItem key={child.id} menu={child} onClick={onClick} />
            ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
