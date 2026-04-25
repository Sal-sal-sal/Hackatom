"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchSupplies } from "@/lib/api/supplies"

interface SupplyStats { todo: number; in_progress: number; done: number; nuclear: number; total: number }

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

export function SuppliesChart() {
  const [stats, setStats] = useState<SupplyStats | null>(null)

  useEffect(() => {
    fetchSupplies()
      .then((s) => setStats({
        total: s.length,
        todo: s.filter(x => x.status === "todo").length,
        in_progress: s.filter(x => x.status === "in_progress").length,
        done: s.filter(x => x.status === "done").length,
        nuclear: s.filter(x => x.nuclear_grade_required).length,
      }))
      .catch(() => {})
  }, [])

  const max = stats?.total ?? 1

  return (
    <Card className="border bg-card">
      <CardHeader className="pb-3"><CardTitle className="text-base font-medium">Supply Chain Status</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {stats ? (
          <>
            <Bar value={stats.todo}        max={max} color="bg-slate-400" label="To Do" />
            <Bar value={stats.in_progress} max={max} color="bg-amber-500" label="In Progress" />
            <Bar value={stats.done}        max={max} color="bg-green-500" label="Completed" />
            <p className="text-xs text-muted-foreground pt-1">
              Nuclear-grade required: <span className="font-medium text-foreground">{stats.nuclear}</span> of {stats.total}
            </p>
          </>
        ) : <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>}
      </CardContent>
    </Card>
  )
}
