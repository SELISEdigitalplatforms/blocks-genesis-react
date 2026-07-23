import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Switch } from "@/components/core/switch/switch";

describe("Switch", () => {
  it("renders a switch control", () => {
    render(<Switch aria-label="toggle" />);
    expect(screen.getByRole("switch", { name: "toggle" })).toBeInTheDocument();
  });
});
