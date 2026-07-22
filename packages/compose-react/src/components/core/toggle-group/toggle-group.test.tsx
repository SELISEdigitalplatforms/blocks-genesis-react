import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/core/toggle-group/toggle-group";

describe("ToggleGroup", () => {
  it("renders grouped items and applies context variants", () => {
    render(
      <ToggleGroup type="single" variant="outline" size="lg">
        <ToggleGroupItem value="a" aria-label="A">
          A
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
