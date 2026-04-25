"use client"

import { useCallback, useEffect, useState } from "react"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchBrigades, updateBrigade } from "@/lib/api/employ"
import type { ApiBrigade } from "@/lib/api/types"

interface Props { sectorId: number | null }

export function SectorAvailableBrigadesTab({ sectorId }: Props) {
  const [items, setItems] = useState<ApiBrigade[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    fetchBrigades({ available: true })
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])

  const assign = async (id: number) => {
    if (sectorId == null) return
    setBusyId(id)
    try {
      await updateBrigade(id, { current_sector_id: sectorId })
      reload()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {loading ? "Загрузка…" : `${items.length} свободных бригад`}
      </p>
      {!loading && items.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Свободных бригад нет — все распределены по секторам.
        </p>
      )}
      <ul className="space-y-2">
        {items.map((b) => (
          <li key={b.id} className="rounded-md border border-border p-3 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{b.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {b.specialization} · лидер: {b.leader_name}
                </p>
              </div>
              <Badge variant="secondary">{b.members_count} чел</Badge>
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => assign(b.id)}
                disabled={!sectorId || busyId === b.id}
              >
                <UserPlus className="h-3.5 w-3.5 mr-1" />
                {busyId === b.id ? "…" : "Назначить"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
