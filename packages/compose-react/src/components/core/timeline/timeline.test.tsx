import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Timeline } from "@/components/core/timeline/timeline";

describe("Timeline", () => {
  it("renders events with default content and a revert action", () => {
    const onRevert = vi.fn();
    render(
      <Timeline
        events={[{ time: "10:00", date: "2024", description: "Deployed" }]}
        onRevert={onRevert}
      />,
    );
    expect(screen.getByText("Deployed")).toBeInTheDocument();
    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("Revert")).toBeInTheDocument();
  });

  it("omits the revert control when onRevert is not provided", () => {
    render(<Timeline events={[{ description: "Read only" }]} />);
    expect(screen.getByText("Read only")).toBeInTheDocument();
    expect(screen.queryByText("Revert")).not.toBeInTheDocument();
  });

  it("renders custom left and right content for each event", () => {
    render(
      <Timeline
        events={[{ description: "one" }, { description: "two" }]}
        leftContent={(event) => <span>L:{event.description}</span>}
        rightContent={(event) => <span>R:{event.description}</span>}
      />,
    );
    expect(screen.getByText("L:one")).toBeInTheDocument();
    expect(screen.getByText("R:two")).toBeInTheDocument();
  });
});
