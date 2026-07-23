import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MaskedText } from "@/components/core/masked-text/masked-text";

describe("MaskedText", () => {
  it("masks the whole string by default", () => {
    render(<MaskedText text="secret" />);
    expect(screen.getByText("******")).toBeInTheDocument();
  });

  it("reveals the first and last N characters", () => {
    render(<MaskedText text="1234567890" showFirstN={2} showLastN={2} />);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("90")).toBeInTheDocument();
    expect(screen.getByText("******")).toBeInTheDocument();
  });

  it("renders safely for empty text", () => {
    const { container } = render(<MaskedText text="" />);
    expect(container.firstChild).toBeTruthy();
  });
});
