import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/core/radio-group/radio-group";

describe("RadioGroup", () => {
  it("renders each radio item", () => {
    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" />
      </RadioGroup>,
    );
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });
});
