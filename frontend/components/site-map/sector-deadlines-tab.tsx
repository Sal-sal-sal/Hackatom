"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { fetchSectorDeadlines } from "@/lib/api/sectors"
import type { ApiDeadline } from "@/lib/api/types"
import { AddDeadlineDialog } from "@/components/deadlines/add-deadline-dialog"

interface Props { zoneId: string; sectorId: number | null }

const TYPE_LABEL: Record<ApiDeadline["type"], string> = {
  general: "Общее", supply: "Поставка", hr: "HR",
}
const PRIORITY_VARIANT: Record<ApiDeadline["priority"], "default" | "secondary" | "outline"> = {
  high: "default", medium: "secondary", low: "outline",
}

export function SectorDeadlinesTab({ zoneId, sectorId }: Props) {
  const [items, setItems] = useState<ApiDeadline[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const reload = useCallback(() => {
    setLoading(true)
    fetchSectorDeadlines(zoneId)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [zoneId])

  useEffect(() => { reload() }, [reload])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {loading ? "Загрузка…" : `${items.length} задач`}
        </p>
        <Button size="sm" variant="outline" onClick={() => setAdding(true)} disabled={!sectorId}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Создать
        </Button>
      </div>
      {!loading && items.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Задач в этом секторе нет.
        </p>
      )}
      <ul className="space-y-2">
        {items.map((d) => (
          <li key={d.id} className="rounded-md border border-border p-3 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{d.title}</p>
                <p className="text-xs text-muted-foreground">
                  {TYPE_LABEL[d.type]} · до {d.deadline_date}
                </p>
              </div>
              <Badge variant={PRIORITY_VARIANT[d.priority]}>{d.priority}</Badge>
            </div>
            <Progress value={d.progress} className="h-1.5" />
          </li>
        ))}
      </ul>
      <AddDeadlineDialog
        open={adding}
        onOpenChange={setAdding}
        onCreated={reload}
        sectorId={sectorId ?? undefined}
      />
    </div>
  )
}
