import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/core/popover/popover";

describe("Popover", () => {
  it("renders popover content when open", () => {
    render(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Panel</PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("Panel")).toBeInTheDocument();
  });
});
