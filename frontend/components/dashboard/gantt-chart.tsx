"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchGantt } from "@/lib/api/dashboard"
import type { ApiGanttResponse } from "@/lib/api/types"
import { cn } from "@/lib/utils"

const categoryColors = {
  foundation: { bar: "bg-blue-500", bg: "bg-blue-200 dark:bg-blue-900" },
  electrical:  { bar: "bg-amber-500", bg: "bg-amber-200 dark:bg-amber-900" },
  structural:  { bar: "bg-green-500", bg: "bg-green-200 dark:bg-green-900" },
  safety:      { bar: "bg-red-500",  bg: "bg-red-200 dark:bg-red-900" },
}

const categoryLabels = {
  foundation: "Foundation", electrical: "Electrical",
  structural: "Structural", safety: "Safety",
}

function parseDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function addDays(base: Date, n: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export function GanttChart() {
  const [data, setData] = useState<ApiGanttResponse | null>(null)

  useEffect(() => {
    fetchGantt()
      .then(setData)
      .catch(() => setData({ chart_start: new Date().toISOString().slice(0, 10), chart_end: new Date().toISOString().slice(0, 10), items: [] }))
  }, [])

  if (!data) return (
    <Card className="border bg-card">
      <CardHeader className="pb-3"><CardTitle className="text-base font-medium">4D scheduling</CardTitle></CardHeader>
      <CardContent><p className="p-4 text-sm text-muted-foreground">Loading…</p></CardContent>
    </Card>
  )

  const chartStart = parseDate(data.chart_start)
  const chartEnd   = parseDate(data.chart_end)
  const totalDays  = Math.max(daysBetween(chartStart, chartEnd), 1)

  // Tick every 7 days, max ~12 ticks
  const tickInterval = totalDays <= 30 ? 7 : totalDays <= 60 ? 14 : 21
  const ticks: number[] = []
  for (let i = 0; i <= totalDays; i += tickInterval) ticks.push(i)

  const pct = (days: number) => `${(days / totalDays) * 100}%`

  return (
    <Card className="border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-medium">
            4D scheduling — {fmtDate(chartStart)} → {fmtDate(chartEnd)}
          </CardTitle>
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
        <div className="overflow-x-auto" data-testid="gantt-chart">
          <div className="min-w-[700px]">

            {/* Header row with date ticks */}
            <div className="flex border-t border-border">
              <div className="w-52 shrink-0 border-r border-border px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">Task</span>
              </div>
              <div className="relative flex-1 h-8">
                {ticks.map((dayOffset) => (
                  <div
                    key={dayOffset}
                    className="absolute top-0 h-full flex flex-col justify-center"
                    style={{ left: pct(dayOffset) }}
                  >
                    <div className="h-full border-l border-border/50" />
                    <span className="absolute top-1 pl-1 text-[10px] text-muted-foreground whitespace-nowrap">
                      {fmtDate(addDays(chartStart, dayOffset))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Task rows */}
            {data.items.map((task) => {
              const taskStart = parseDate(task.start_date)
              const taskEnd   = parseDate(task.end_date)
              const left      = Math.max(daysBetween(chartStart, taskStart), 0)
              const width     = Math.max(daysBetween(taskStart, taskEnd), 1)
              const colors    = categoryColors[task.category]
              return (
                <div key={task.id} className="flex border-t border-border">
                  <div className="w-52 shrink-0 border-r border-border px-3 py-2">
                    <span className="text-xs text-foreground truncate block" title={task.name}>{task.name}</span>
                    <span className="text-[10px] text-muted-foreground">{fmtDate(taskStart)} – {fmtDate(taskEnd)}</span>
                  </div>
                  <div className="relative flex-1 py-2 min-h-[36px]">
                    {/* Background tick lines */}
                    {ticks.map((d) => (
                      <div key={d} className="absolute top-0 h-full border-l border-border/30" style={{ left: pct(d) }} />
                    ))}
                    {/* Task bar */}
                    <div
                      className={cn("absolute top-1/2 -translate-y-1/2 h-5 rounded overflow-hidden", colors.bg)}
                      style={{ left: pct(left), width: pct(width) }}
                    >
                      <div className={cn("h-full rounded-l", colors.bar)} style={{ width: `${task.progress}%` }} />
                    </div>
                    {/* Progress label inside bar */}
                    {width / totalDays > 0.08 && (
                      <span
                        className="absolute top-1/2 -translate-y-1/2 text-[10px] font-medium text-white mix-blend-difference px-1 pointer-events-none"
                        style={{ left: pct(left) }}
                      >
                        {task.progress}%
                      </span>
                    )}
                  </div>
                </div>
              )
            })}

            {data.items.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No scheduled tasks.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
