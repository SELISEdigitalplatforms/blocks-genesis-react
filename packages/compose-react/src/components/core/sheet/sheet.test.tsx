import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/core/sheet/sheet";

describe("Sheet", () => {
  it("renders sheet content with title and description when open", () => {
    render(
      <Sheet open>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Panel</SheetTitle>
            <SheetDescription>Body</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <button>Save</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Panel")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("hides the close button when hideClose is set", () => {
    render(
      <Sheet open>
        <SheetContent hideClose>
          <SheetTitle>Panel</SheetTitle>
          <SheetDescription>Body</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });
});
