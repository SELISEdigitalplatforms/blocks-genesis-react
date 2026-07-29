import type { UniqueIdentifier } from "@dnd-kit/core";

export const DEFAULT_KANBAN_COLUMNS = [
  { id: "todo" as const, title: "Todo" },
  { id: "in-progress" as const, title: "In progress" },
  { id: "done" as const, title: "Done" },
] as const;

export type KanbanColumnId = (typeof DEFAULT_KANBAN_COLUMNS)[number]["id"];

export interface KanbanColumn {
  id: UniqueIdentifier;
  title: string;
}

export interface KanbanTask {
  id: UniqueIdentifier;
  columnId: KanbanColumnId;
  content: string;
}

export type KanbanColumnType = "Column";

export interface KanbanColumnDragData {
  type: KanbanColumnType;
  column: KanbanColumn;
}

export type KanbanTaskType = "Task";

export interface KanbanTaskDragData {
  type: KanbanTaskType;
  task: KanbanTask;
}
