"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchKpi } from "@/lib/api/dashboard"
import type { ApiKpi } from "@/lib/api/types"

const BARS = [
  { key: "total" as const,       label: "Total",       color: "bg-slate-400" },
  { key: "completed" as const,   label: "Completed",   color: "bg-green-500" },
  { key: "in_progress" as const, label: "In Progress", color: "bg-amber-500" },
  { key: "overdue" as const,     label: "Overdue",     color: "bg-red-500" },
]

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-xs text-muted-foreground text-right shrink-0">{label}</div>
      <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`} style={{ width: `${Math.max(pct, 4)}%` }}>
          <span className="text-[11px] font-medium text-white">{value}</span>
        </div>
      </div>
      <div className="w-10 text-xs text-muted-foreground">{Math.round(pct)}%</div>
    </div>
  )
}

export function DeadlinesChart() {
  const [kpi, setKpi] = useState<ApiKpi | null>(null)

  useEffect(() => { fetchKpi().then(setKpi).catch(() => {}) }, [])

  return (
    <Card className="border bg-card">
      <CardHeader className="pb-3"><CardTitle className="text-base font-medium">Tasks Overview</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {kpi ? BARS.map((b) => (
          <Bar key={b.key} value={kpi[b.key]} max={kpi.total} color={b.color} label={b.label} />
        )) : <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>}
        {kpi && (
          <p className="text-xs text-muted-foreground pt-1">
            Upcoming in 7 days: <span className="font-medium text-foreground">{kpi.upcoming_7days}</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
