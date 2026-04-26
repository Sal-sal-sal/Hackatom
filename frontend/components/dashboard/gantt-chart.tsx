"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchGantt } from "@/lib/api/dashboard"
import type { ApiGanttResponse } from "@/lib/api/types"
import { cn } from "@/lib/utils"

const categoryColors = {
  foundation: { bar: "bg-blue-500", bg: "bg-blue-200 dark:bg-blue-900" },
  electrical: { bar: "bg-amber-500", bg: "bg-amber-200 dark:bg-amber-900" },
  structural: { bar: "bg-green-500", bg: "bg-green-200 dark:bg-green-900" },
  safety:     { bar: "bg-red-500",   bg: "bg-red-200 dark:bg-red-900" },
}

const categoryLabels = {
  foundation: "Foundation", electrical: "Electrical",
  structural: "Structural", safety: "Safety",
}

const parseDate = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d) }
const addDays = (b: Date, n: number) => { const d = new Date(b); d.setDate(d.getDate() + n); return d }
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86_400_000)
const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })

export function GanttChart() {
  const [data, setData] = useState<ApiGanttResponse | null>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    fetchGantt()
      .then(setData)
      .catch(() => setData({ chart_start: new Date().toISOString().slice(0, 10), chart_end: new Date().toISOString().slice(0, 10), items: [] }))
  }, [])

  const view = useMemo(() => {
    if (!data) return null
    const baseStart = parseDate(data.chart_start)
    const baseEnd   = parseDate(data.chart_end)
    const windowDays = Math.max(daysBetween(baseStart, baseEnd), 1)
    return {
      start: addDays(baseStart, offset),
      end:   addDays(baseEnd,   offset),
      windowDays,
      step:  Math.max(Math.round(windowDays / 2), 1),
    }
  }, [data, offset])

  if (!data || !view) return (
    <Card className="border bg-card">
      <CardHeader className="pb-3"><CardTitle className="text-base font-medium">4D scheduling</CardTitle></CardHeader>
      <CardContent><p className="p-4 text-sm text-muted-foreground">Loading…</p></CardContent>
    </Card>
  )

  const { start: viewStart, end: viewEnd, windowDays, step } = view
  const tickInterval = windowDays <= 30 ? 7 : windowDays <= 60 ? 14 : 21
  const ticks: number[] = []
  for (let i = 0; i <= windowDays; i += tickInterval) ticks.push(i)
  const pct = (days: number) => `${(days / windowDays) * 100}%`

  const visibleTasks = data.items.filter((t) => {
    const s = parseDate(t.start_date), e = parseDate(t.end_date)
    return daysBetween(viewStart, e) >= 0 && daysBetween(s, viewEnd) >= 0
  })

  return (
    <Card className="border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium text-foreground/90">
              4D scheduling — {fmtDate(viewStart)} → {fmtDate(viewEnd)}
            </CardTitle>
            <div className="flex items-center gap-1 ml-2">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setOffset((o) => o - step)} aria-label="Previous period">
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => setOffset(0)} aria-label="Reset to today" disabled={offset === 0}>
                <Calendar className="h-3 w-3" /> Today
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setOffset((o) => o + step)} aria-label="Next period">
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
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

            <div className="flex border-t border-border">
              <div className="w-52 shrink-0 border-r border-border px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">Task</span>
              </div>
              <div className="relative flex-1 h-8">
                {ticks.map((dayOffset) => (
                  <div key={dayOffset} className="absolute top-0 h-full flex flex-col justify-center" style={{ left: pct(dayOffset) }}>
                    <div className="h-full border-l border-border/50" />
                    <span className="absolute top-1 pl-1 text-[10px] text-muted-foreground whitespace-nowrap">
                      {fmtDate(addDays(viewStart, dayOffset))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {visibleTasks.map((task) => {
              const taskStart = parseDate(task.start_date)
              const taskEnd   = parseDate(task.end_date)
              const rawLeft   = daysBetween(viewStart, taskStart)
              const rawEnd    = daysBetween(viewStart, taskEnd)
              const left      = Math.max(rawLeft, 0)
              const right     = Math.min(rawEnd, windowDays)
              const width     = Math.max(right - left, 1)
              const colors    = categoryColors[task.category]
              return (
                <div key={task.id} className="flex border-t border-border">
                  <div className="w-52 shrink-0 border-r border-border px-3 py-2">
                    <span className="text-xs text-foreground/90 truncate block" title={task.name}>{task.name}</span>
                    <span className="text-[10px] text-muted-foreground">{fmtDate(taskStart)} – {fmtDate(taskEnd)}</span>
                  </div>
                  <div className="relative flex-1 py-2 min-h-[36px]">
                    {ticks.map((d) => (
                      <div key={d} className="absolute top-0 h-full border-l border-border/30" style={{ left: pct(d) }} />
                    ))}
                    <div
                      className={cn("absolute top-1/2 -translate-y-1/2 h-5 rounded overflow-hidden", colors.bg)}
                      style={{ left: pct(left), width: pct(width) }}
                    >
                      <div className={cn("h-full rounded-l", colors.bar)} style={{ width: `${task.progress}%` }} />
                    </div>
                    {width / windowDays > 0.08 && (
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

            {visibleTasks.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No tasks in this period. Use ← / → or Today to navigate.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
