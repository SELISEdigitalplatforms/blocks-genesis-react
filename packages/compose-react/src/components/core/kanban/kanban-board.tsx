import {
  DndContext,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, arrayMove } from "@dnd-kit/sortable"
import { useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { KanbanBoardColumn, KanbanBoardContainer } from "./board-column"
import { hasDraggableData } from "./dnd-utils"
import { kanbanKeyboardCoordinateGetter } from "./multiple-containers-keyboard-preset"
import { KanbanTaskCard } from "./task-card"
import {
  DEFAULT_KANBAN_COLUMNS,
  type KanbanColumn,
  type KanbanColumnId,
  type KanbanTask,
} from "./types"

export type { KanbanColumnId, KanbanColumn, KanbanTask } from "./types"

const initialTasks: KanbanTask[] = [
  { id: "task1", columnId: "done", content: "Project initiation and planning" },
  { id: "task2", columnId: "done", content: "Gather requirements from stakeholders" },
  { id: "task3", columnId: "done", content: "Create wireframes and mockups" },
  { id: "task4", columnId: "in-progress", content: "Develop homepage layout" },
  { id: "task5", columnId: "in-progress", content: "Design color scheme and typography" },
  { id: "task6", columnId: "todo", content: "Implement user authentication" },
  { id: "task7", columnId: "todo", content: "Build contact us page" },
  { id: "task8", columnId: "todo", content: "Create product catalog" },
  { id: "task9", columnId: "todo", content: "Develop about us page" },
  { id: "task10", columnId: "todo", content: "Optimize website for mobile devices" },
  { id: "task11", columnId: "todo", content: "Integrate payment gateway" },
  { id: "task12", columnId: "todo", content: "Perform testing and bug fixing" },
  { id: "task13", columnId: "todo", content: "Launch website and deploy to server" },
]

export const KanbanBoard = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>([...DEFAULT_KANBAN_COLUMNS])
  const pickedUpTaskColumn = useRef<KanbanColumnId | null>(null)
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns])

  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks)
  const [activeColumn, setActiveColumn] = useState<KanbanColumn | null>(null)
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: kanbanKeyboardCoordinateGetter,
    })
  )

  const getDraggingTaskData = (taskId: UniqueIdentifier, columnId: KanbanColumnId) => {
    const tasksInColumn = tasks.filter((task) => task.columnId === columnId)
    const taskPosition = tasksInColumn.findIndex((task) => task.id === taskId)
    const column = columns.find((col) => col.id === columnId)
    return {
      tasksInColumn,
      taskPosition,
      column,
    }
  }

  const announcements: Announcements = {
    onDragStart({ active }) {
      if (!hasDraggableData(active)) return
      if (active.data.current?.type === "Column") {
        const startColumnIdx = columnsId.findIndex((id) => id === active.id)
        const startColumn = columns[startColumnIdx]
        return `Picked up Column ${startColumn?.title} at position: ${
          startColumnIdx + 1
        } of ${columnsId.length}`
      }
      if (active.data.current?.type === "Task") {
        pickedUpTaskColumn.current = active.data.current.task.columnId
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          active.id,
          pickedUpTaskColumn.current
        )
        return `Picked up Task ${
          active.data.current.task.content
        } at position: ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`
      }
    },
    onDragOver({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) return

      if (
        active.data.current?.type === "Column" &&
        over.data.current?.type === "Column"
      ) {
        const overColumnIdx = columnsId.findIndex((id) => id === over.id)
        return `Column ${active.data.current.column.title} was moved over ${
          over.data.current.column.title
        } at position ${overColumnIdx + 1} of ${columnsId.length}`
      }
      if (
        active.data.current?.type === "Task" &&
        over.data.current?.type === "Task"
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          over.data.current.task.columnId
        )
        if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
          return `Task ${
            active.data.current.task.content
          } was moved over column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`
        }
        return `Task was moved over position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`
      }
    },
    onDragEnd({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) {
        pickedUpTaskColumn.current = null
        return
      }
      if (
        active.data.current?.type === "Column" &&
        over.data.current?.type === "Column"
      ) {
        const overColumnPosition = columnsId.findIndex((id) => id === over.id)
        return `Column ${
          active.data.current.column.title
        } was dropped into position ${overColumnPosition + 1} of ${
          columnsId.length
        }`
      }
      if (
        active.data.current?.type === "Task" &&
        over.data.current?.type === "Task"
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          over.data.current.task.columnId
        )
        if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
          return `Task was dropped into column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`
        }
        return `Task was dropped into position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`
      }
      pickedUpTaskColumn.current = null
    },
    onDragCancel({ active }) {
      pickedUpTaskColumn.current = null
      if (!hasDraggableData(active)) return
      return `Dragging ${active.data.current?.type} cancelled.`
    },
  }

  const onDragStart = (event: DragStartEvent) => {
    if (!hasDraggableData(event.active)) return
    const data = event.active.data.current
    if (data?.type === "Column") {
      setActiveColumn(data.column)
      return
    }
    if (data?.type === "Task") {
      setActiveTask(data.task)
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null)
    setActiveTask(null)

    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (!hasDraggableData(active)) return

    const activeData = active.data.current

    if (activeId === overId) return

    const isActiveAColumn = activeData?.type === "Column"
    if (!isActiveAColumn) return

    setColumns((prev) => {
      const activeColumnIndex = prev.findIndex((col) => col.id === activeId)
      const overColumnIndex = prev.findIndex((col) => col.id === overId)
      return arrayMove(prev, activeColumnIndex, overColumnIndex)
    })
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    if (!hasDraggableData(active) || !hasDraggableData(over)) return

    const activeData = active.data.current
    const overData = over.data.current

    const isActiveATask = activeData?.type === "Task"
    const isOverATask = overData?.type === "Task"

    if (!isActiveATask) return

    if (isActiveATask && isOverATask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId)
        const overIndex = prev.findIndex((t) => t.id === overId)
        const activeTaskItem = prev[activeIndex]
        const overTask = prev[overIndex]
        if (
          activeTaskItem &&
          overTask &&
          activeTaskItem.columnId !== overTask.columnId
        ) {
          activeTaskItem.columnId = overTask.columnId
          return arrayMove(prev, activeIndex, overIndex - 1)
        }
        return arrayMove(prev, activeIndex, overIndex)
      })
    }

    const isOverAColumn = overData?.type === "Column"

    if (isActiveATask && isOverAColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId)
        const activeTaskItem = prev[activeIndex]
        if (activeTaskItem) {
          activeTaskItem.columnId = overId as KanbanColumnId
          return arrayMove(prev, activeIndex, activeIndex)
        }
        return prev
      })
    }
  }

  return (
    <DndContext
      accessibility={{ announcements }}
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <KanbanBoardContainer>
        <SortableContext items={columnsId}>
          {columns.map((col) => (
            <KanbanBoardColumn
              key={col.id}
              column={col}
              tasks={tasks.filter((task) => task.columnId === col.id)}
            />
          ))}
        </SortableContext>
      </KanbanBoardContainer>

      {typeof document !== "undefined" &&
        createPortal(
          <DragOverlay>
            {activeColumn && (
              <KanbanBoardColumn
                isOverlay
                column={activeColumn}
                tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
              />
            )}
            {activeTask && <KanbanTaskCard task={activeTask} isOverlay />}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  )
}
