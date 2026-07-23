import {
  closestCorners,
  getFirstCollision,
  KeyboardCode,
  type DroppableContainer,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core"

const directions: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
]

type CoordinateContext = Parameters<KeyboardCoordinateGetter>[1]["context"]
type ActiveNode = NonNullable<CoordinateContext["active"]>
type CollisionRect = NonNullable<CoordinateContext["collisionRect"]>

function shouldPushContainer(
  entry: DroppableContainer,
  active: ActiveNode,
  collisionRect: CollisionRect,
  droppableRects: CoordinateContext["droppableRects"],
  code: string,
): boolean {
  if (!entry || entry?.disabled) return false

  const rect = droppableRects.get(entry.id)
  if (!rect) return false

  const data = entry.data.current
  if (data) {
    const { type, children } = data
    if (
      type === "Column" &&
      children?.length > 0 &&
      active.data.current?.type !== "Column"
    ) {
      return false
    }
  }

  const activeIsColumn = active.data.current?.type === "Column"
  switch (code) {
    case KeyboardCode.Down:
      return !activeIsColumn && collisionRect.top < rect.top
    case KeyboardCode.Up:
      return !activeIsColumn && collisionRect.top > rect.top
    case KeyboardCode.Left:
      return collisionRect.left >= rect.left + rect.width
    case KeyboardCode.Right:
      return collisionRect.left + collisionRect.width <= rect.left
    default:
      return false
  }
}

function resolveCoordinates(
  active: ActiveNode,
  collisionRect: CollisionRect,
  droppableRects: CoordinateContext["droppableRects"],
  droppableContainers: CoordinateContext["droppableContainers"],
  filteredContainers: DroppableContainer[],
) {
  const collisions = closestCorners({
    active,
    collisionRect,
    droppableRects,
    droppableContainers: filteredContainers,
    pointerCoordinates: null,
  })
  const closestId = getFirstCollision(collisions, "id")

  if (closestId != null) {
    const newDroppable = droppableContainers.get(closestId)
    const newNode = newDroppable?.node.current
    const newRect = newDroppable?.rect.current

    if (newNode && newRect) {
      return {
        x: newRect.left,
        y: newRect.top,
      }
    }
  }

  return undefined
}

export const kanbanKeyboardCoordinateGetter: KeyboardCoordinateGetter = (
  event,
  { context: { active, droppableRects, droppableContainers, collisionRect } },
) => {
  if (!directions.includes(event.code)) {
    return undefined
  }

  event.preventDefault()

  if (!active || !collisionRect) {
    return
  }

  const filteredContainers: DroppableContainer[] = []

  droppableContainers.getEnabled().forEach((entry) => {
    if (
      shouldPushContainer(
        entry,
        active,
        collisionRect,
        droppableRects,
        event.code,
      )
    ) {
      filteredContainers.push(entry)
    }
  })

  return resolveCoordinates(
    active,
    collisionRect,
    droppableRects,
    droppableContainers,
    filteredContainers,
  )
}
