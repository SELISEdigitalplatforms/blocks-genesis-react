import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ICoreApiEndpoint } from "./core-api-endpoint.model";
import { CoreApiGroupSection } from "./core-api-group-section";

vi.mock("./core-api-endpoint-row", () => ({
  CoreApiEndpointRow: ({ endpoint }: { endpoint: ICoreApiEndpoint }) => (
    <div data-testid="row">{endpoint.summary}</div>
  ),
}));

const endpoints: ICoreApiEndpoint[] = [
  { itemId: "1", method: "GET", summary: "List", path: "/a" },
  { itemId: "2", method: "POST", summary: "Create", path: "/b" },
];

describe("CoreApiGroupSection", () => {
  it("shows the tag and endpoint count, collapsed by default", () => {
    render(<CoreApiGroupSection tag="Iam" endpoints={endpoints} />);

    expect(screen.getByText("Iam")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("renders a row per endpoint and expands on click", () => {
    render(<CoreApiGroupSection tag="Iam" endpoints={endpoints} />);

    expect(screen.getAllByTestId("row")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});
