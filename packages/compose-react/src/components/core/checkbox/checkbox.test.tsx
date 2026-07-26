import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Checkbox } from "@/components/core/checkbox/checkbox";

describe("Checkbox", () => {
  it("renders a checkbox in the checked state", () => {
    render(<Checkbox defaultChecked aria-label="agree" />);
    expect(screen.getByRole("checkbox", { name: "agree" })).toBeInTheDocument();
  });
});
