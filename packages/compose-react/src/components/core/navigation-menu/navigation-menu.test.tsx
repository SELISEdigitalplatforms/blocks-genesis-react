import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
} from "@/components/core/navigation-menu/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/core/navigation-menu/navigation-menu-trigger-style";

describe("NavigationMenu", () => {
  it("renders the trigger and the open item's content", () => {
    render(
      <NavigationMenu defaultValue="products">
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#">A link</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuIndicator />
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("A link")).toBeInTheDocument();
  });

  it("exposes the trigger style helper", () => {
    expect(typeof navigationMenuTriggerStyle()).toBe("string");
  });
});
