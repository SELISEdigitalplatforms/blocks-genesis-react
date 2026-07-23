import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KanbanBoard } from "@/components/core/kanban/kanban-board";

describe("KanbanBoard", () => {
  it("renders its columns and task cards from the default data", () => {
    render(<KanbanBoard />);
    expect(screen.getByText("Develop homepage layout")).toBeInTheDocument();
    expect(
      screen.getByText("Implement user authentication"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Task").length).toBeGreaterThan(0);
  });
});
