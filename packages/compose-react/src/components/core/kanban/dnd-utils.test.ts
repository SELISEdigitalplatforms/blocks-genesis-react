import { describe, expect, it } from "vitest";
import type { Active } from "@dnd-kit/core";

import { hasDraggableData } from "./dnd-utils";

const entryWith = (data: unknown): Active =>
  ({ id: "x", data: { current: data } }) as Active;

describe("hasDraggableData", () => {
  it("rejects null and undefined entries", () => {
    expect(hasDraggableData(null)).toBe(false);
    expect(hasDraggableData(undefined)).toBe(false);
  });

  it("rejects entries without kanban drag data", () => {
    expect(hasDraggableData(entryWith(undefined))).toBe(false);
    expect(hasDraggableData(entryWith({ type: "Other" }))).toBe(false);
  });

  it("accepts Column and Task drag data", () => {
    expect(
      hasDraggableData(
        entryWith({ type: "Column", column: { id: "todo", title: "Todo" } }),
      ),
    ).toBe(true);
    expect(
      hasDraggableData(
        entryWith({
          type: "Task",
          task: { id: "t", columnId: "todo", content: "c" },
        }),
      ),
    ).toBe(true);
  });
});
