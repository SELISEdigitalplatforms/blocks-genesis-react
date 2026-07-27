import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { IDomain } from "@/models/project.model";
import { CnameValidatorDialog } from "./dialog";

vi.mock("./validator-project", () => ({
  CnameValidatorProject: ({ cookieDomain }: { cookieDomain: string }) => (
    <div data-testid="validator">{cookieDomain}</div>
  ),
}));

const baseDomain = {
  domain: "https://asif.example.com",
  cookieDomain: "example.com",
  isDomainVerified: false,
} as unknown as IDomain;

const renderDialog = (domain: IDomain | null) =>
  render(<CnameValidatorDialog open onOpenChange={vi.fn()} domain={domain} />);

describe("CnameValidatorDialog", () => {
  it("shows the domain summary and the unverified error banner", () => {
    renderDialog(baseDomain);

    expect(screen.getByText("Validate Domain")).toBeInTheDocument();
    expect(screen.getByText("https://asif.example.com")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();
    expect(screen.getByText(/No servers found/)).toBeInTheDocument();
  });

  it("passes the protocol-stripped host to the validator", () => {
    renderDialog(baseDomain);

    expect(screen.getByTestId("validator")).toHaveTextContent(
      "asif.example.com",
    );
  });

  it("shows the success note and hides the instructions when verified", () => {
    renderDialog({ ...baseDomain, isDomainVerified: true } as IDomain);

    expect(
      screen.getByText("This domain is verified and ready to use."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/No servers found/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("validator")).not.toBeInTheDocument();
  });

  it("renders only the header when there is no domain", () => {
    renderDialog(null);

    expect(screen.getByText("Validate Domain")).toBeInTheDocument();
    expect(screen.queryByText(/No servers found/)).not.toBeInTheDocument();
  });
});
