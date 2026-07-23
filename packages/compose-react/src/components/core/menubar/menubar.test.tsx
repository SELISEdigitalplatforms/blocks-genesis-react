import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarShortcut,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from "@/components/core/menubar/menubar";

describe("Menubar", () => {
  it("renders an open menu with its items", () => {
    render(
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Actions</MenubarLabel>
            <MenubarItem>
              New
              <MenubarShortcut>N</MenubarShortcut>
            </MenubarItem>
            <MenubarCheckboxItem checked>Show</MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarRadioGroup value="a">
              <MenubarRadioItem value="a">Radio A</MenubarRadioItem>
            </MenubarRadioGroup>
            <MenubarSub>
              <MenubarSubTrigger>More</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Deep</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("Radio A")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });
});
