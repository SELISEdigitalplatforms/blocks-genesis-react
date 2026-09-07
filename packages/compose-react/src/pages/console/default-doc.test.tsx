import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DefaultDoc } from "./default-doc";

describe("DefaultDoc", () => {
  it("renders the three resource cards and their bento actions", () => {
    render(<DefaultDoc />);

    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByText("Build with CLI")).toBeInTheDocument();
    expect(screen.getByText("Code with Skills")).toBeInTheDocument();
    expect(screen.getByText("Learn")).toBeInTheDocument();
    expect(screen.getByText("Build")).toBeInTheDocument();
    expect(screen.getByText("Automate")).toBeInTheDocument();
    expect(screen.getAllByText("Explore resource")).toHaveLength(3);
  });

  it("points each card at its external resource", () => {
    render(<DefaultDoc />);

    expect(screen.getByRole("link", { name: /^Docs:/ })).toHaveAttribute(
      "href",
      "https://docs.seliseblocks.com",
    );
    expect(
      screen.getByRole("link", { name: /^Build with CLI:/ }),
    ).toHaveAttribute(
      "href",
      "https://github.com/SELISEdigitalplatforms/blocks-cli",
    );
    expect(
      screen.getByRole("link", { name: /^Code with Skills:/ }),
    ).toHaveAttribute(
      "href",
      "https://github.com/SELISEdigitalplatforms/blocks-skills",
    );
  });
});
