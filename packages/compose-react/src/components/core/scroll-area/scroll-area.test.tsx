import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScrollArea } from "@/components/core/scroll-area/scroll-area";

describe("ScrollArea", () => {
  it("renders its content within the scroll viewport", () => {
    render(
      <ScrollArea>
        <div>scrollable</div>
      </ScrollArea>,
    );
    expect(screen.getByText("scrollable")).toBeInTheDocument();
  });
});
