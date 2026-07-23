import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CNameInstruction } from "./instructions";

describe("CNameInstruction", () => {
  it("renders both CNAME records when a cookie domain is provided", () => {
    render(
      <CNameInstruction
        cookieDomainName="example.com"
        customDomain="https://asif.example.com"
      />,
    );

    expect(screen.getByText(/two CNAME records/)).toBeInTheDocument();
    expect(screen.getByText("CNAME configuration 1")).toBeInTheDocument();
    expect(screen.getByText("asif.example.com")).toBeInTheDocument();
    expect(screen.getByText("blocksapi.example.com")).toBeInTheDocument();
  });

  it("renders a single CNAME record when no cookie domain is provided", () => {
    render(<CNameInstruction cookieDomainName="" />);

    expect(screen.getByText(/CNAME record to your/)).toBeInTheDocument();
    expect(
      screen.queryByText("CNAME configuration 1"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("blocksapi.")).toBeInTheDocument();
  });
});
