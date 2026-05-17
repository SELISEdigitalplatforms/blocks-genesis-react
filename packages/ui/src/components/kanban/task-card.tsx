import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cva } from "class-variance-authority"
import { GripVertical } from "lucide-react"

import { Badge } from "@blocks/ui/components/badge"
import { Button } from "@blocks/ui/components/button"
import { Card, CardContent, CardHeader } from "@blocks/ui/components/card"

import type { KanbanTask, KanbanTaskDragData } from "./types"

export type { KanbanColumnId, KanbanTask } from "./types"

interface KanbanTaskCardProps {
  task: KanbanTask
  isOverlay?: boolean
}

export const KanbanTaskCard = ({ task, isOverlay }: KanbanTaskCardProps) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    } satisfies KanbanTaskDragData,
    attributes: {
      roleDescription: "Task",
    },
  })

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  }

  const variants = cva("bg-card text-card-foreground", {
    variants: {
      dragging: {
        over: "opacity-30 ring-2 ring-ring",
        overlay: "ring-2 ring-primary",
      },
    },
  })

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      <CardHeader className="relative flex flex-row justify-between border-b border-border bg-muted/30 px-3 py-3">
        <Button
          variant="ghost"
          {...attributes}
          {...listeners}
          className="-ml-2 h-auto cursor-grab p-1 text-muted-foreground hover:text-foreground"
        >
          <span className="sr-only">Move task</span>
          <GripVertical />
        </Button>
        <Badge variant="outline" className="ml-auto font-semibold">
          Task
        </Badge>
      </CardHeader>
      <CardContent className="whitespace-pre-wrap px-3 pb-6 pt-3 text-left">
        {task.content}
      </CardContent>
    </Card>
  )
}
