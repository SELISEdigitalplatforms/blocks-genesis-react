import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { KanbanTaskCard } from "@/components/core/kanban/task-card";

const renderCard = (isOverlay?: boolean) =>
  render(
    <DndContext>
      <SortableContext items={["t1"]}>
        <KanbanTaskCard
          task={{ id: "t1", columnId: "todo", content: "My task" } as never}
          isOverlay={isOverlay}
        />
      </SortableContext>
    </DndContext>,
  );

describe("KanbanTaskCard", () => {
  it("renders the task content with a drag handle", () => {
    renderCard();
    expect(screen.getByText("My task")).toBeInTheDocument();
    expect(screen.getByText("Move task")).toBeInTheDocument();
  });

  it("applies overlay styling in overlay mode", () => {
    renderCard(true);
    expect(screen.getByText("My task")).toBeInTheDocument();
  });
});
