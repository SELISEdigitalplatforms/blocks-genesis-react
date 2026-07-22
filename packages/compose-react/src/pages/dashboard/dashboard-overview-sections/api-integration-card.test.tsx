import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppIntegrationCard } from "./api-integration-card";

describe("AppIntegrationCard", () => {
  it("renders the loading skeleton and no content while loading", () => {
    render(<AppIntegrationCard isLoading title="Connect Extensions" />);

    expect(screen.queryByText("Connect Extensions")).not.toBeInTheDocument();
    expect(screen.queryByText("Client ID")).not.toBeInTheDocument();
  });

  it("renders the default title and the empty-state message", () => {
    render(<AppIntegrationCard />);

    expect(screen.getByText("Connect Extensions")).toBeInTheDocument();
    expect(
      screen.getByText("No integration details available for this app yet."),
    ).toBeInTheDocument();
  });

  it("renders the provided description", () => {
    render(<AppIntegrationCard description="Localization integration" />);

    expect(screen.getByText("Localization integration")).toBeInTheDocument();
  });

  it("renders client id and secret labels when both are provided", () => {
    render(
      <AppIntegrationCard clientId="abc123456789" clientSecret="secret-value" />,
    );

    expect(screen.getByText("Client ID")).toBeInTheDocument();
    expect(screen.getByText("Client Secret")).toBeInTheDocument();
    expect(
      screen.queryByText("No integration details available for this app yet."),
    ).not.toBeInTheDocument();
  });

  it("renders integration links as external anchors", () => {
    render(
      <AppIntegrationCard
        links={[
          {
            id: "docs",
            label: "Documentation",
            href: "https://example.com/docs",
            icon: <span>icon</span>,
          },
        ]}
      />,
    );

    const link = screen.getByRole("link", { name: "Documentation" });
    expect(link).toHaveAttribute("href", "https://example.com/docs");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
