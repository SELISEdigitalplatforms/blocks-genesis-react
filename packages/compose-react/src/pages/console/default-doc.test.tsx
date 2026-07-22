import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DefaultDoc } from "./default-doc";

describe("DefaultDoc", () => {
  it("renders a card link for each documentation entry", () => {
    render(<DefaultDoc />);

    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByText("Code")).toBeInTheDocument();
    expect(screen.getByText("Cloud")).toBeInTheDocument();
  });

  it("points each card at its external url", () => {
    render(<DefaultDoc />);

    expect(screen.getByText("Code").closest("a")).toHaveAttribute(
      "href",
      "https://github.com/SELISEdigitalplatforms",
    );
  });
});
