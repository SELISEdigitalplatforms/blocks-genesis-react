import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("test harness", () => {
  it("renders and queries the DOM via jsdom + Testing Library", () => {
    render(<button type="button">Save changes</button>);
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeInTheDocument();
  });
});
