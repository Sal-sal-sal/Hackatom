"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GripVertical, Package, Users, Plus } from "lucide-react"
import { PriorityBadge, ComplexityBadge } from "@/components/badges"
import { TaskProgressBar, DeadlineIndicator } from "@/components/progress-indicators"
import { fetchKanban } from "@/lib/api/deadlines"
import { mapDeadlineToTask } from "@/lib/api/mappers"
import { AddDeadlineDialog } from "./add-deadline-dialog"
import type { Task, Status } from "@/lib/mock-data"
import { getDaysUntilDeadline } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const STATUS_MAP: Record<Status, string> = {
  "not-started": "todo",
  "in-progress": "in_progress",
  "completed": "done",
}

const columns: { id: Status; title: string; color: string }[] = [
  { id: "not-started", title: "To do", color: "bg-blue-500" },
  { id: "in-progress", title: "In progress", color: "bg-amber-500" },
  { id: "completed", title: "Done", color: "bg-green-500" },
]

function TaskCard({ task }: { task: Task }) {
  const daysUntil = getDaysUntilDeadline(task.deadline)
  return (
    <Card className="group border bg-card transition-all hover:border-primary/50 hover:shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 cursor-grab opacity-0 transition-opacity group-hover:opacity-100">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground leading-tight">{task.title}</p>
              {task.type === "supply"
                ? <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                : <Users className="h-4 w-4 shrink-0 text-muted-foreground" />}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <PriorityBadge priority={task.priority} />
              <ComplexityBadge complexity={task.complexity} />
            </div>
            {task.status !== "completed" && (
              <div className="flex items-center gap-2">
                <TaskProgressBar progress={task.progress} className="flex-1" />
                <span className="text-xs text-muted-foreground">{task.progress}%</span>
              </div>
            )}
            <div className={cn(
              "text-xs",
              daysUntil < 0 && "text-red-600 dark:text-red-400",
              daysUntil >= 0 && daysUntil <= 7 && "text-amber-600 dark:text-amber-400",
              daysUntil > 7 && "text-muted-foreground",
            )}>
              <DeadlineIndicator deadline={task.deadline} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function KanbanBoard() {
  const [data, setData] = useState<Record<Status, Task[]> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [addFor, setAddFor] = useState<Status | null>(null)

  const load = useCallback(() => {
    fetchKanban().then((kb) => setData({
      "not-started": kb.todo.map(mapDeadlineToTask),
      "in-progress": kb.in_progress.map(mapDeadlineToTask),
      "completed": kb.done.map(mapDeadlineToTask),
    })).catch((e) => setError(e.message))
  }, [])

  useEffect(() => { load() }, [load])

  if (error) return <p className="text-sm text-red-600">Failed to load kanban: {error}</p>
  if (!data) return <p className="text-sm text-muted-foreground">Loading kanban…</p>

  return (
    <>
      <div data-testid="kanban-board" className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = data[column.id]
          return (
            <div key={column.id} data-testid={`kanban-col-${column.id}`} className="flex flex-col">
              <div className="mb-3 flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", column.color)} />
                <h3 className="text-sm font-medium text-foreground">{column.title}</h3>
                <span className="text-sm text-muted-foreground">({columnTasks.length})</span>
              </div>
              <div className="flex-1 rounded-lg border border-dashed border-border bg-muted/20 p-2">
                <div className="space-y-2">
                  {columnTasks.map((task) => <TaskCard key={task.id} task={task} />)}
                </div>
                <Button
                  variant="ghost"
                  className="mt-2 w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => setAddFor(column.id)}
                >
                  <Plus className="mr-1.5 h-4 w-4" />Add task
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <AddDeadlineDialog
        open={addFor !== null}
        onOpenChange={(v) => !v && setAddFor(null)}
        onCreated={() => { setAddFor(null); load() }}
        defaultStatus={addFor ? STATUS_MAP[addFor] : "todo"}
      />
    </>
  )
}
