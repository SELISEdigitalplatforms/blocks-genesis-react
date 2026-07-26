import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Separator } from "@/components/core/separator/separator";

describe("Separator", () => {
  it("renders a horizontal separator by default", () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toHaveClass("h-[1px]");
  });

  it("renders a vertical separator when requested", () => {
    const { container } = render(<Separator orientation="vertical" />);
    expect(container.firstChild).toHaveClass("w-[1px]");
  });
});
