"use client"

import { useEffect, useState } from "react"
import { Users, Shield, Package, AlertTriangle } from "lucide-react"
import { fetchKpi } from "@/lib/api/dashboard"
import { fetchEmployees, fetchBrigades } from "@/lib/api/employ"
import { fetchSupplies } from "@/lib/api/supplies"

interface Stat { label: string; value: number; icon: React.ReactNode; color: string }

export function AnalyticsKpi() {
  const [stats, setStats] = useState<Stat[]>([])

  useEffect(() => {
    Promise.all([fetchEmployees(), fetchBrigades(), fetchSupplies(), fetchKpi()])
      .then(([employees, brigades, supplies, kpi]) => {
        setStats([
          { label: "Total Workers", value: employees.length, icon: <Users className="h-5 w-5" />, color: "text-blue-600 dark:text-blue-400" },
          { label: "Active Brigades", value: brigades.length, icon: <Shield className="h-5 w-5" />, color: "text-green-600 dark:text-green-400" },
          { label: "Supply Items", value: supplies.length, icon: <Package className="h-5 w-5" />, color: "text-amber-600 dark:text-amber-400" },
          { label: "Overdue Tasks", value: kpi.overdue, icon: <AlertTriangle className="h-5 w-5" />, color: "text-red-600 dark:text-red-400" },
        ])
      })
      .catch(() => {})
  }, [])

  if (!stats.length) return <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => (
    <div key={i} className="rounded-lg border border-border bg-card p-5 animate-pulse h-24" />
  ))}</div>

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="group rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/50 hover:bg-foreground/[0.03] dark:hover:bg-foreground/[0.04]"
        >
          <div className={`${s.color} mb-2 transition-transform duration-200 group-hover:scale-110`}>{s.icon}</div>
          <div className="text-2xl font-bold text-foreground/90">{s.value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
