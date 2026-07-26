import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, renderHook } from "@testing-library/react";
import { TooltipProvider } from "@/components/core/tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/core/sidebar/sidebar";
import { useSidebar } from "@/components/core/sidebar/use-sidebar";

const h = vi.hoisted(() => ({ isMobile: false }));
vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => h.isMobile }));

const Tree = () => (
  <Sidebar>
    <SidebarHeader>
      <SidebarInput placeholder="Search" />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Group</SidebarGroupLabel>
        <SidebarGroupAction>GroupAction</SidebarGroupAction>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Home">Home</SidebarMenuButton>
              <SidebarMenuAction>Action</SidebarMenuAction>
              <SidebarMenuBadge>5</SidebarMenuBadge>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton>Sub</SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarSeparator />
    </SidebarContent>
    <SidebarFooter>Footer</SidebarFooter>
    <SidebarRail />
  </Sidebar>
);

const renderSidebar = (providerProps: Record<string, unknown> = {}) =>
  render(
    <TooltipProvider>
      <SidebarProvider {...providerProps}>
        <Tree />
        <SidebarInset>
          <SidebarTrigger />
          <main>content</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>,
  );

describe("Sidebar", () => {
  beforeEach(() => {
    h.isMobile = false;
  });

  it("renders the full expanded sidebar tree", () => {
    renderSidebar();
    expect(screen.getByText("Group")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Sub")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders collapsed when the provider starts closed", () => {
    renderSidebar({ defaultOpen: false });
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("toggles open state when the trigger is clicked", () => {
    renderSidebar();
    const [trigger] = screen.getAllByRole("button", {
      name: /toggle sidebar/i,
    });
    fireEvent.click(trigger!);
    expect(trigger).toBeInTheDocument();
  });

  it("toggles via the keyboard shortcut", () => {
    renderSidebar();
    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders the mobile sheet variant", async () => {
    h.isMobile = true;
    renderSidebar();
    const [trigger] = screen.getAllByRole("button", {
      name: /toggle sidebar/i,
    });
    fireEvent.click(trigger!);
    expect(await screen.findByText("Home")).toBeInTheDocument();
  });

  it("throws when useSidebar is used outside a provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useSidebar())).toThrow(
      "useSidebar must be used within a SidebarProvider.",
    );
    spy.mockRestore();
  });
});
