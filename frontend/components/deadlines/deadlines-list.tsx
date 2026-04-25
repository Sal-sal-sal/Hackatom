"use client"

import { useEffect, useState } from "react"
import { listDeadlines } from "@/lib/api/deadlines"
import type { ApiDeadline } from "@/lib/api/types"
import { PriorityBadge, ComplexityBadge } from "@/components/badges"
import { getDaysUntilDeadline, formatDate } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const STATUS_LABEL: Record<string, string> = { todo: "To Do", in_progress: "In Progress", done: "Done" }
const STATUS_STYLE: Record<string, string> = {
  todo: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  in_progress: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  done: "bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
}

export function DeadlinesList() {
  const [items, setItems] = useState<ApiDeadline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listDeadlines()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
  if (error) return <p className="text-sm text-red-600 py-8 text-center">Error: {error}</p>

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {["Title", "Type", "Priority", "Complexity", "Status", "Start", "Deadline", "Days left"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((d) => {
            const days = getDaysUntilDeadline(d.deadline_date)
            return (
              <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground max-w-[220px] truncate">{d.title}</td>
                <td className="px-4 py-3 text-muted-foreground capitalize">{d.type}</td>
                <td className="px-4 py-3"><PriorityBadge priority={d.priority} /></td>
                <td className="px-4 py-3"><ComplexityBadge complexity={d.complexity} /></td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", STATUS_STYLE[d.status])}>
                    {STATUS_LABEL[d.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{d.start_date ? formatDate(d.start_date) : "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(d.deadline_date)}</td>
                <td className={cn("px-4 py-3 font-medium", days < 0 ? "text-red-600" : days <= 3 ? "text-amber-600" : "text-foreground")}>
                  {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
                </td>
              </tr>
            )
          })}
          {items.length === 0 && (
            <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No deadlines found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
