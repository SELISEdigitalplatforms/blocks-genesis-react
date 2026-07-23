import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ICoreApiEndpoint } from "./core-api-endpoint.model";
import { CoreApiEndpointRow } from "./core-api-endpoint-row";

describe("CoreApiEndpointRow", () => {
  it("renders the method badge, summary and path", () => {
    render(
      <CoreApiEndpointRow
        endpoint={
          {
            itemId: "1",
            method: "GET",
            summary: "List Users",
            path: "https://svc/users",
          } as ICoreApiEndpoint
        }
      />,
    );

    expect(screen.getByText("GET")).toBeInTheDocument();
    expect(screen.getByText("List Users")).toBeInTheDocument();
    expect(screen.getByText("https://svc/users")).toBeInTheDocument();
    expect(screen.getByText("Copy as cURL")).toBeInTheDocument();
  });

  it("omits the method badge when the endpoint has no method", () => {
    render(
      <CoreApiEndpointRow
        endpoint={
          { itemId: "2", summary: "No Method", path: "/x" } as ICoreApiEndpoint
        }
      />,
    );

    expect(screen.getByText("No Method")).toBeInTheDocument();
    expect(screen.queryByText("GET")).not.toBeInTheDocument();
  });
});
