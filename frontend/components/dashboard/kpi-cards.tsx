"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Clock, AlertTriangle, ListTodo } from "lucide-react"
import { fetchKpi } from "@/lib/api/dashboard"
import type { ApiKpi } from "@/lib/api/types"

export function KPICards() {
  const [kpi, setKpi] = useState<ApiKpi | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchKpi().then(setKpi).catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="text-sm text-red-600">Failed to load KPI: {error}</p>
  if (!kpi) return <p className="text-sm text-muted-foreground">Loading KPI…</p>

  const total = kpi.total || 1
  const pct = (n: number) => Math.round((n / total) * 100)
  const cards = [
    { label: "Total tasks", value: kpi.total, icon: ListTodo, color: "blue", sub: `${kpi.upcoming_7days} upcoming 7d` },
    { label: "Completed", value: kpi.completed, icon: CheckCircle2, color: "green", sub: `${pct(kpi.completed)}% of total` },
    { label: "In progress", value: kpi.in_progress, icon: Clock, color: "amber", sub: `${pct(kpi.in_progress)}% of total` },
    { label: "Overdue", value: kpi.overdue, icon: AlertTriangle, color: "red", sub: `${pct(kpi.overdue)}% of total` },
  ]

  return (
    <div data-testid="kpi-cards" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className="border bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="mt-1 text-3xl font-semibold text-foreground">{c.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-${c.color}-100 dark:bg-${c.color}-900`}>
                <c.icon className={`h-5 w-5 text-${c.color}-600 dark:text-${c.color}-400`} />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
