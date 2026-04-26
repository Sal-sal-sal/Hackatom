"use client"

import { useEffect, useState } from "react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchEmployees, fetchVacancies } from "@/lib/api/employ"

interface WorkerStats { inBrigades: number; unassigned: number; vacancies: number }

const COLORS = {
  inBrigades: "#22c55e",
  unassigned: "#f59e0b",
  vacancies: "#ef4444",
}

export function WorkersChart() {
  const [stats, setStats] = useState<WorkerStats | null>(null)

  useEffect(() => {
    Promise.all([fetchEmployees(), fetchVacancies()])
      .then(([employees, vacancies]) => setStats({
        inBrigades: employees.filter(e => e.brigade_id !== null).length,
        unassigned: employees.filter(e => e.brigade_id === null).length,
        vacancies: vacancies.filter(v => v.status !== "done").length,
      }))
      .catch(() => {})
  }, [])

  const data = stats ? [
    { name: "In Brigades",    value: stats.inBrigades, color: COLORS.inBrigades },
    { name: "Unassigned",     value: stats.unassigned, color: COLORS.unassigned },
    { name: "Open Vacancies", value: stats.vacancies,  color: COLORS.vacancies },
  ].filter((d) => d.value > 0) : []

  const total = stats ? stats.inBrigades + stats.unassigned : 0

  return (
    <Card className="border bg-card transition-colors duration-200 hover:border-primary/50 hover:bg-foreground/[0.03] dark:hover:bg-foreground/[0.04]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-foreground/90">Workforce Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {stats ? (
          <div className="relative h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                  stroke="var(--background)"
                  strokeWidth={2}
                >
                  {data.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--popover-foreground)", fontWeight: 500 }}
                  itemStyle={{ color: "var(--popover-foreground)" }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 8, color: "var(--foreground)" }}
                  formatter={(v) => <span style={{ color: "var(--foreground)" }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center -mt-6">
              <span className="text-2xl font-semibold text-foreground/90">{total}</span>
              <span className="text-xs text-muted-foreground">Total Workers</span>
            </div>
          </div>
        ) : <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>}
      </CardContent>
    </Card>
  )
}
