import { describe, expect, it, vi } from "vitest";
import type { Active, ClientRect, DroppableContainer } from "@dnd-kit/core";

import { kanbanKeyboardCoordinateGetter } from "./multiple-containers-keyboard-preset";

const rect = (
  left: number,
  top: number,
  width = 100,
  height = 100,
): ClientRect => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
});

const makeContainer = (
  id: string,
  r: ClientRect,
  data: Record<string, unknown> = { type: "Task" },
): DroppableContainer =>
  ({
    id,
    disabled: false,
    data: { current: data },
    node: { current: document.createElement("div") },
    rect: { current: r },
  }) as unknown as DroppableContainer;

const makeArgs = (
  containers: DroppableContainer[],
  activeType: string,
  collisionRect: ClientRect,
) => {
  const rects = new Map(
    containers.map((c) => [c.id, c.rect.current as ClientRect]),
  );
  const byId = new Map(containers.map((c) => [c.id, c]));
  return {
    context: {
      active: {
        id: "active",
        data: { current: { type: activeType } },
      } as unknown as Active,
      droppableRects: rects,
      droppableContainers: {
        getEnabled: () => containers,
        get: (id: string) => byId.get(id),
      },
      collisionRect,
    },
  };
};

const keyEvent = (code: string) => {
  const event = new KeyboardEvent("keydown", { code });
  vi.spyOn(event, "preventDefault");
  return event;
};

describe("kanbanKeyboardCoordinateGetter", () => {
  it("ignores keys that are not arrow keys", () => {
    const args = makeArgs(
      [makeContainer("a", rect(200, 0))],
      "Task",
      rect(0, 0),
    );
    expect(
      kanbanKeyboardCoordinateGetter(keyEvent("Space"), args as never),
    ).toBeUndefined();
  });

  it("returns undefined when nothing is being dragged", () => {
    const args = makeArgs(
      [makeContainer("a", rect(200, 0))],
      "Task",
      rect(0, 0),
    );
    args.context.active = null as never;
    expect(
      kanbanKeyboardCoordinateGetter(keyEvent("ArrowRight"), args as never),
    ).toBeUndefined();
  });

  it("moves a task to the droppable on its right", () => {
    const target = makeContainer("right", rect(200, 0));
    const args = makeArgs(
      [makeContainer("self", rect(0, 0)), target],
      "Task",
      rect(0, 0),
    );
    const event = keyEvent("ArrowRight");
    const coords = kanbanKeyboardCoordinateGetter(event, args as never);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(coords).toEqual({ x: 200, y: 0 });
  });

  it("moves a task to the droppable below", () => {
    const below = makeContainer("below", rect(0, 300));
    const args = makeArgs([below], "Task", rect(0, 0));
    expect(
      kanbanKeyboardCoordinateGetter(keyEvent("ArrowDown"), args as never),
    ).toEqual({ x: 0, y: 300 });
  });

  it("does not move a column vertically", () => {
    const below = makeContainer("below", rect(0, 300), { type: "Column" });
    const args = makeArgs([below], "Column", rect(0, 0));
    expect(
      kanbanKeyboardCoordinateGetter(keyEvent("ArrowDown"), args as never),
    ).toBeUndefined();
  });

  it("returns undefined when no droppable lies in the pressed direction", () => {
    const args = makeArgs(
      [makeContainer("left", rect(0, 0))],
      "Task",
      rect(500, 0),
    );
    expect(
      kanbanKeyboardCoordinateGetter(keyEvent("ArrowRight"), args as never),
    ).toBeUndefined();
  });
});
