import { useDndContext } from "@dnd-kit/core"
import { SortableContext, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cva } from "class-variance-authority"
import { GripVertical } from "lucide-react"
import * as React from "react"
import { useMemo } from "react"

import { Button } from "@/components/core/button"
import { Card, CardContent, CardHeader } from "@/components/core/card"
import { ScrollArea, ScrollBar } from "@/components/core/scroll-area"

import { KanbanTaskCard } from "./task-card"
import type {
  KanbanColumn,
  KanbanColumnDragData,
  KanbanTask,
} from "./types"

export type { KanbanColumn } from "./types"

interface KanbanBoardColumnProps {
  column: KanbanColumn
  tasks: KanbanTask[]
  isOverlay?: boolean
}

export const KanbanBoardColumn = ({
  column,
  tasks,
  isOverlay,
}: KanbanBoardColumnProps) => {
  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks])

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    } satisfies KanbanColumnDragData,
    attributes: {
      roleDescription: `Column: ${column.title}`,
    },
  })

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  }

  const variants = cva(
    "flex h-[500px] max-h-[500px] w-[350px] max-w-full shrink-0 snap-center flex-col",
    {
      variants: {
        dragging: {
          default: "border-2 border-transparent",
          over: "opacity-30 ring-2 ring-ring",
          overlay: "ring-2 ring-primary",
        },
      },
    }
  )

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/50 p-4 text-left font-semibold text-card-foreground">
        <Button
          variant="ghost"
          {...attributes}
          {...listeners}
          className="relative -ml-2 h-auto cursor-grab p-1 text-muted-foreground hover:text-foreground"
        >
          <span className="sr-only">{`Move column: ${column.title}`}</span>
          <GripVertical />
        </Button>
        <span className="ml-auto">{column.title}</span>
      </CardHeader>
      <ScrollArea>
        <CardContent className="flex grow flex-col gap-2 p-2">
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <KanbanTaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </CardContent>
      </ScrollArea>
    </Card>
  )
}

export const KanbanBoardContainer = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const dndContext = useDndContext()

  const variations = cva("flex px-2 pb-4 md:px-0 lg:justify-center", {
    variants: {
      dragging: {
        default: "snap-x snap-mandatory",
        active: "snap-none",
      },
    },
  })

  return (
    <ScrollArea
      className={variations({
        dragging: dndContext.active ? "active" : "default",
      })}
    >
      <div className="flex flex-row items-center justify-center gap-4">
        {children}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
