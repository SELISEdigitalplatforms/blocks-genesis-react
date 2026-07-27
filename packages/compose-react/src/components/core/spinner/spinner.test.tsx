import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "@/components/core/spinner/spinner";

describe("Spinner", () => {
  it("renders a status role with the default label", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("accepts a custom label and size", () => {
    render(<Spinner label="Please wait" size="lg" />);
    expect(
      screen.getByRole("status", { name: "Please wait" }),
    ).toBeInTheDocument();
  });
});
