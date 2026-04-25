"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { fetchSectorSupplies } from "@/lib/api/sectors"
import type { ApiSupply } from "@/lib/api/types"
import { AddSupplyDialog } from "@/components/supplies/add-supply-dialog"

interface Props { zoneId: string; sectorId: number | null }

const STATUS_LABEL: Record<ApiSupply["status"], string> = {
  todo: "К выполнению", in_progress: "В работе", done: "Готово",
}
const STATUS_VARIANT: Record<ApiSupply["status"], "default" | "secondary" | "outline"> = {
  todo: "outline", in_progress: "default", done: "secondary",
}

export function SectorSuppliesTab({ zoneId, sectorId }: Props) {
  const [items, setItems] = useState<ApiSupply[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const reload = useCallback(() => {
    setLoading(true)
    fetchSectorSupplies(zoneId)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [zoneId])

  useEffect(() => { reload() }, [reload])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {loading ? "Загрузка…" : `${items.length} поставок`}
        </p>
        <Button size="sm" variant="outline" onClick={() => setAdding(true)} disabled={!sectorId}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Создать
        </Button>
      </div>
      {!loading && items.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Поставок в этом секторе нет.
        </p>
      )}
      <ul className="space-y-2">
        {items.map((s) => (
          <li key={s.id} className="rounded-md border border-border p-3 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{s.material_name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.quantity} {s.unit} · до {s.deadline}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[s.status]}>{STATUS_LABEL[s.status]}</Badge>
            </div>
            <Progress value={s.progress} className="h-1.5" />
          </li>
        ))}
      </ul>
      <AddSupplyDialog
        open={adding}
        onOpenChange={setAdding}
        onCreated={reload}
        sectorId={sectorId ?? undefined}
      />
    </div>
  )
}
