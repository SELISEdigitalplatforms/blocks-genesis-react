import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RenderConditionally } from "@/components/core/render-elements/render-conditionally";

describe("RenderConditionally", () => {
  it("renders its children when the condition is true", () => {
    render(
      <RenderConditionally condition={true}>
        <span>Shown</span>
      </RenderConditionally>,
    );
    expect(screen.getByText("Shown")).toBeInTheDocument();
  });

  it("renders nothing when the condition is false", () => {
    const { container } = render(
      <RenderConditionally condition={false}>
        <span>Hidden</span>
      </RenderConditionally>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
