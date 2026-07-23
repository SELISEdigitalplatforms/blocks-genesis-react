import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RenderAlternatively } from "@/components/core/render-elements/render-alternatively";

describe("RenderAlternatively", () => {
  it("renders the true branch when the condition is true", () => {
    render(
      <RenderAlternatively
        condition={true}
        whenTrue={<span>TrueBranch</span>}
        whenFalse={<span>FalseBranch</span>}
      />,
    );
    expect(screen.getByText("TrueBranch")).toBeInTheDocument();
    expect(screen.queryByText("FalseBranch")).not.toBeInTheDocument();
  });

  it("renders the false branch when the condition is false", () => {
    render(
      <RenderAlternatively
        condition={false}
        whenTrue={<span>TrueBranch</span>}
        whenFalse={<span>FalseBranch</span>}
      />,
    );
    expect(screen.getByText("FalseBranch")).toBeInTheDocument();
  });
});
