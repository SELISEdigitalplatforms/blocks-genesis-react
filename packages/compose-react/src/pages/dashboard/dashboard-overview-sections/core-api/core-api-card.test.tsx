import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ICoreApiEndpoint } from "./core-api-endpoint.model";
import { CoreApiCard } from "./core-api-card";

vi.mock("./core-api-group-section", () => ({
  CoreApiGroupSection: ({ tag }: { tag: string }) => (
    <div data-testid="group">{tag}</div>
  ),
}));

const endpoints: ICoreApiEndpoint[] = [
  { itemId: "1", method: "GET", summary: "List", path: "/a", tag: "Iam" },
  { itemId: "2", method: "POST", summary: "Create", path: "/b", tag: "Mfa" },
];

describe("CoreApiCard", () => {
  it("renders the loading skeleton without the title while loading", () => {
    render(<CoreApiCard isLoading endpoints={[]} />);

    expect(screen.queryByText("Core APIs")).not.toBeInTheDocument();
  });

  it("groups endpoints by tag into sections", () => {
    render(<CoreApiCard endpoints={endpoints} />);

    expect(screen.getByText("Core APIs")).toBeInTheDocument();
    const groups = screen.getAllByTestId("group");
    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveTextContent("Iam");
    expect(groups[1]).toHaveTextContent("Mfa");
  });

  it("shows the empty message when there are no endpoints", () => {
    render(<CoreApiCard endpoints={[]} />);

    expect(
      screen.getByText("No endpoints available for this module."),
    ).toBeInTheDocument();
  });

  it("shows the error message when loading failed and there are no groups", () => {
    render(<CoreApiCard endpoints={[]} error={new Error("boom")} />);

    expect(
      screen.getByText("Couldn't load endpoints for this module."),
    ).toBeInTheDocument();
  });
});
