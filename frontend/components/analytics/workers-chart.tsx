"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchEmployees, fetchVacancies } from "@/lib/api/employ"

interface WorkerStats { total: number; inBrigades: number; unassigned: number; vacancies: number }

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-xs text-muted-foreground text-right shrink-0">{label}</div>
      <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`} style={{ width: `${Math.max(pct, 4)}%` }}>
          <span className="text-[11px] font-medium text-white">{value}</span>
        </div>
      </div>
      <div className="w-10 text-xs text-muted-foreground">{Math.round(pct)}%</div>
    </div>
  )
}

export function WorkersChart() {
  const [stats, setStats] = useState<WorkerStats | null>(null)

  useEffect(() => {
    Promise.all([fetchEmployees(), fetchVacancies()])
      .then(([employees, vacancies]) => setStats({
        total: employees.length,
        inBrigades: employees.filter(e => e.brigade_id !== null).length,
        unassigned: employees.filter(e => e.brigade_id === null).length,
        vacancies: vacancies.filter(v => v.status !== "done").length,
      }))
      .catch(() => {})
  }, [])

  const max = stats ? Math.max(stats.total, stats.vacancies) : 1

  return (
    <Card className="border bg-card">
      <CardHeader className="pb-3"><CardTitle className="text-base font-medium">Workforce Breakdown</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {stats ? (
          <>
            <Bar value={stats.total}      max={max} color="bg-blue-500"  label="Total Workers" />
            <Bar value={stats.inBrigades} max={max} color="bg-green-500" label="In Brigades" />
            <Bar value={stats.unassigned} max={max} color="bg-amber-500" label="Unassigned" />
            <Bar value={stats.vacancies}  max={max} color="bg-red-500"   label="Open Vacancies" />
          </>
        ) : <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>}
      </CardContent>
    </Card>
  )
}
