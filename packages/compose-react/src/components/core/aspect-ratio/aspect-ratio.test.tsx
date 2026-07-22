import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AspectRatio } from "@/components/core/aspect-ratio/aspect-ratio";

describe("AspectRatio", () => {
  it("renders its children inside the ratio wrapper", () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <span>media</span>
      </AspectRatio>,
    );
    expect(screen.getByText("media")).toBeInTheDocument();
  });
});
