import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "@/components/core/select/select";

describe("Select", () => {
  it("renders the trigger and the open content with grouped items", () => {
    render(
      <Select open defaultValue="a">
        <SelectTrigger aria-label="pick">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Group</SelectLabel>
            <SelectItem value="a">Apple</SelectItem>
            <SelectItem value="b">Banana</SelectItem>
            <SelectSeparator />
          </SelectGroup>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByText("Group")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.getAllByText("Apple").length).toBeGreaterThan(0);
  });
});
