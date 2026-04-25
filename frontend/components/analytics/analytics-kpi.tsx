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
          { label: "Total Workers", value: employees.length, icon: <Users className="h-5 w-5" />, color: "text-blue-600" },
          { label: "Active Brigades", value: brigades.length, icon: <Shield className="h-5 w-5" />, color: "text-green-600" },
          { label: "Supply Items", value: supplies.length, icon: <Package className="h-5 w-5" />, color: "text-amber-600" },
          { label: "Overdue Tasks", value: kpi.overdue, icon: <AlertTriangle className="h-5 w-5" />, color: "text-red-600" },
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
        <div key={s.label} className="rounded-lg border border-border bg-card p-5">
          <div className={`${s.color} mb-2`}>{s.icon}</div>
          <div className="text-2xl font-bold text-foreground">{s.value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
