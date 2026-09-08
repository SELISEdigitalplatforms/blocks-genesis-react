import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DefaultDoc } from "./default-doc";

describe("DefaultDoc", () => {
  it("renders the three resource cards and their bento actions", () => {
    render(<DefaultDoc />);

    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(screen.getByText("Read Docs")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Install CLI" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Bootstrap")).toBeInTheDocument();
    expect(screen.getByText("Learn")).toBeInTheDocument();
    expect(screen.getByText("Build")).toBeInTheDocument();
    expect(screen.getByText("Automate")).toBeInTheDocument();
    expect(screen.getByText("Start Reading")).toBeInTheDocument();
    expect(screen.getByText("See Installation Steps")).toBeInTheDocument();
    expect(screen.getByText("Set Up Your Agent")).toBeInTheDocument();
  });

  it("points each card at its external resource", () => {
    render(<DefaultDoc />);

    expect(screen.getByRole("link", { name: /^Read Docs:/ })).toHaveAttribute(
      "href",
      "https://docs.seliseblocks.com",
    );
    expect(screen.getByRole("link", { name: /^Install CLI:/ })).toHaveAttribute(
      "href",
      "https://github.com/SELISEdigitalplatforms/blocks-cli",
    );
    expect(screen.getByRole("link", { name: /^Bootstrap:/ })).toHaveAttribute(
      "href",
      "https://github.com/SELISEdigitalplatforms/blocks-skills",
    );
  });
});
