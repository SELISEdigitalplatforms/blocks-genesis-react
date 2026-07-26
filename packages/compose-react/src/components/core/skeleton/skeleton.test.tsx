import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "@/components/core/skeleton/skeleton";

describe("Skeleton", () => {
  it("renders a pulsing placeholder that merges custom classes", () => {
    const { container } = render(<Skeleton className="h-4" />);
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain("animate-pulse");
    expect(element.className).toContain("h-4");
  });
});
