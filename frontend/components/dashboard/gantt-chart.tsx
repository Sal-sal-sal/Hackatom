"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchGantt } from "@/lib/api/dashboard"
import type { ApiGanttItem } from "@/lib/api/types"
import { cn } from "@/lib/utils"

const categoryColors = {
  foundation: { bar: "bg-blue-500", bg: "bg-blue-200 dark:bg-blue-900" },
  electrical: { bar: "bg-amber-500", bg: "bg-amber-200 dark:bg-amber-900" },
  structural: { bar: "bg-green-500", bg: "bg-green-200 dark:bg-green-900" },
  safety: { bar: "bg-red-500", bg: "bg-red-200 dark:bg-red-900" },
}

const categoryLabels = {
  foundation: "Foundation", electrical: "Electrical",
  structural: "Structural", safety: "Safety",
}

export function GanttChart() {
  const [tasks, setTasks] = useState<ApiGanttItem[] | null>(null)
  useEffect(() => { fetchGantt().then(setTasks).catch(() => setTasks([])) }, [])

  const days = Array.from({ length: 30 }, (_, i) => i + 1)

  return (
    <Card className="border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">4D scheduling — next 30 days</CardTitle>
          <div className="flex items-center gap-4">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={cn("h-2.5 w-2.5 rounded-full", categoryColors[key as keyof typeof categoryColors].bar)} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!tasks ? <p className="p-4 text-sm text-muted-foreground">Loading…</p> : (
        <div className="overflow-x-auto" data-testid="gantt-chart">
          <div className="min-w-[800px]">
            <div className="flex border-t border-border">
              <div className="w-48 shrink-0 border-r border-border px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">Task</span>
              </div>
              <div className="flex flex-1">
                {days.map((day) => (
                  <div key={day} className={cn(
                    "flex-1 border-r border-border px-0.5 py-2 text-center",
                    day % 7 === 0 && "bg-muted/30",
                  )}>
                    <span className="text-[10px] text-muted-foreground">{day}</span>
                  </div>
                ))}
              </div>
            </div>
            {tasks.map((task) => (
              <div key={task.id} className="flex border-t border-border">
                <div className="w-48 shrink-0 border-r border-border px-3 py-2">
                  <span className="text-xs text-foreground">{task.name}</span>
                </div>
                <div className="relative flex flex-1">
                  {days.map((day) => (
                    <div key={day} className={cn(
                      "flex-1 border-r border-border",
                      day % 7 === 0 && "bg-muted/30",
                    )} />
                  ))}
                  <div
                    className={cn("absolute top-1/2 -translate-y-1/2 h-5 rounded overflow-hidden", categoryColors[task.category].bg)}
                    style={{
                      left: `${(Math.min(task.start_day, 29) / 30) * 100}%`,
                      width: `${(Math.min(task.duration, 30) / 30) * 100}%`,
                    }}
                  >
                    <div className={cn("h-full rounded-l", categoryColors[task.category].bar)}
                         style={{ width: `${task.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <p className="p-4 text-sm text-muted-foreground">No scheduled tasks.</p>}
          </div>
        </div>
        )}
      </CardContent>
    </Card>
  )
}
