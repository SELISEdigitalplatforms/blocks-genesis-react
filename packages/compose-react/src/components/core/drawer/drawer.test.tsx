import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/core/drawer/drawer";

describe("Drawer", () => {
  it("renders drawer content with title and description when open", () => {
    render(
      <Drawer open>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
            <DrawerDescription>Desc</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <button>Save</button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
