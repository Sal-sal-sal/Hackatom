"use client"

import { useEffect, useState } from "react"
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchKpi } from "@/lib/api/dashboard"
import type { ApiKpi } from "@/lib/api/types"

const BARS: { key: keyof ApiKpi; label: string; color: string }[] = [
  { key: "completed",   label: "Completed",   color: "#22c55e" },
  { key: "in_progress", label: "In Progress", color: "#f59e0b" },
  { key: "overdue",     label: "Overdue",     color: "#ef4444" },
]

export function DeadlinesChart() {
  const [kpi, setKpi] = useState<ApiKpi | null>(null)

  useEffect(() => { fetchKpi().then(setKpi).catch(() => {}) }, [])

  const data = kpi ? BARS.map((b) => ({
    name: b.label,
    value: kpi[b.key] as number,
    color: b.color,
  })) : []

  return (
    <Card className="border bg-card transition-colors duration-200 hover:border-primary/50 hover:bg-foreground/[0.03] dark:hover:bg-foreground/[0.04]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-foreground/90">Tasks Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {kpi ? (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)", fillOpacity: 0.4 }}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "var(--popover-foreground)", fontWeight: 500 }}
                    itemStyle={{ color: "var(--popover-foreground)" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {data.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
              <span>Total tasks: <span className="font-medium text-foreground/90">{kpi.total}</span></span>
              <span>Upcoming in 7 days: <span className="font-medium text-foreground/90">{kpi.upcoming_7days}</span></span>
            </div>
          </>
        ) : <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>}
      </CardContent>
    </Card>
  )
}
