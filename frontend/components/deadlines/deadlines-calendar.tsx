"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { listDeadlines } from "@/lib/api/deadlines"
import type { ApiDeadline } from "@/lib/api/types"
import { cn } from "@/lib/utils"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-green-500",
}

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1)
}

export function DeadlinesCalendar() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [items, setItems] = useState<ApiDeadline[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listDeadlines()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const prev = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  const next = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  const firstDay = startOfMonth(year, month)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // Monday-based offset (0=Mon … 6=Sun)
  const offset = (firstDay.getDay() + 6) % 7

  const byDay: Record<number, ApiDeadline[]> = {}
  items.forEach((d) => {
    const date = new Date(d.deadline_date)
    if (date.getFullYear() === year && date.getMonth() === month) {
      const day = date.getDate()
      if (!byDay[day]) byDay[day] = []
      byDay[day].push(d)
    }
  })

  const cells = Array.from({ length: offset + daysInMonth }, (_, i) =>
    i < offset ? null : i - offset + 1
  )
  while (cells.length % 7 !== 0) cells.push(null)

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  const monthLabel = firstDay.toLocaleDateString("en-GB", { month: "long", year: "numeric" })

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <button onClick={prev} className="p-1 rounded hover:bg-muted transition-colors"><ChevronLeft className="h-4 w-4" /></button>
        <span className="text-sm font-medium">{monthLabel}</span>
        <button onClick={next} className="p-1 rounded hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4" /></button>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid grid-cols-7">
          {DAYS.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-[11px] font-medium text-muted-foreground border-b border-border">{d}</div>
          ))}
          {cells.map((day, i) => (
            <div
              key={i}
              className={cn(
                "min-h-[90px] p-1.5 border-b border-r border-border last:border-r-0",
                i % 7 === 6 && "border-r-0",
                !day && "bg-muted/20",
              )}
            >
              {day && (
                <>
                  <span className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium mb-1",
                    isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground",
                  )}>{day}</span>
                  <div className="space-y-0.5">
                    {(byDay[day] ?? []).slice(0, 3).map((d) => (
                      <div key={d.id} className="flex items-center gap-1 rounded px-1 py-0.5 bg-muted/60">
                        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", PRIORITY_DOT[d.priority])} />
                        <span className="text-[10px] truncate text-foreground">{d.title}</span>
                      </div>
                    ))}
                    {(byDay[day]?.length ?? 0) > 3 && (
                      <p className="text-[10px] text-muted-foreground pl-1">+{byDay[day].length - 3} more</p>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
