import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { MobileMenuItem } from "@/components/core/menus/mobile-menu-item";

const wrap = (ui: ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);
const Icon = (props: { className?: string }) => (
  <svg {...props} data-testid="icon-comp" />
);

describe("MobileMenuItem", () => {
  it("renders a leaf menu link with a badge and a component icon", () => {
    wrap(
      <MobileMenuItem
        menu={
          {
            id: "1",
            type: "menu",
            name: "Alerts",
            path: "/alerts",
            badge: "3",
            icon: Icon,
          } as never
        }
      />,
    );
    expect(screen.getByText("Alerts")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByTestId("icon-comp")).toBeInTheDocument();
  });

  it("renders a leaf menu with a pre-built element icon", () => {
    wrap(
      <MobileMenuItem
        menu={
          {
            id: "5",
            type: "menu",
            name: "Docs",
            path: "/docs",
            icon: <svg data-testid="icon-el" />,
          } as never
        }
      />,
    );
    expect(screen.getByTestId("icon-el")).toBeInTheDocument();
  });

  it("opens a sheet to reveal child menu items", () => {
    wrap(
      <MobileMenuItem
        menu={
          {
            id: "3",
            type: "menu",
            name: "Settings",
            path: "/settings",
            children: [
              {
                id: "4",
                type: "menu",
                name: "Profile",
                path: "/settings/profile",
              },
            ],
          } as never
        }
      />,
    );
    fireEvent.click(screen.getByText("Settings"));
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });
});
