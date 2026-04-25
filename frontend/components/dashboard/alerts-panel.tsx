"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, AlertCircle } from "lucide-react"
import { fetchAlerts } from "@/lib/api/dashboard"
import { formatDateTime } from "@/lib/mock-data"
import type { ApiAlert } from "@/lib/api/types"
import { cn } from "@/lib/utils"

export function AlertsPanel() {
  const [items, setItems] = useState<ApiAlert[] | null>(null)

  useEffect(() => { fetchAlerts().then(setItems).catch(() => setItems([])) }, [])

  return (
    <Card className="border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Critical alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3" data-testid="alerts-panel">
        {!items && <p className="text-sm text-muted-foreground">Loading…</p>}
        {items && items.length === 0 && (
          <p className="text-sm text-muted-foreground">No alerts.</p>
        )}
        {items?.map((alert) => (
          <div key={alert.id} className={cn(
            "rounded-lg border p-3",
            alert.severity === "critical"
              ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
              : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950",
          )}>
            <div className="flex items-start gap-3">
              {alert.severity === "critical"
                ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />}
              <div className="min-w-0 flex-1">
                <p className={cn(
                  "text-sm font-medium",
                  alert.severity === "critical"
                    ? "text-red-800 dark:text-red-200"
                    : "text-amber-800 dark:text-amber-200",
                )}>{alert.title}</p>
                <p className={cn(
                  "mt-0.5 text-xs",
                  alert.severity === "critical"
                    ? "text-red-700 dark:text-red-300"
                    : "text-amber-700 dark:text-amber-300",
                )}>{alert.description}</p>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  {formatDateTime(alert.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
