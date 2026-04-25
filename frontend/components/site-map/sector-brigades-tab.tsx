"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchSectorBrigades } from "@/lib/api/sectors"
import { updateBrigade } from "@/lib/api/employ"
import type { ApiBrigade } from "@/lib/api/types"
import { AddBrigadeDialog } from "@/components/hr/add-brigade-dialog"

interface Props { zoneId: string; sectorId: number | null }

export function SectorBrigadesTab({ zoneId, sectorId }: Props) {
  const [brigades, setBrigades] = useState<ApiBrigade[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const reload = useCallback(() => {
    setLoading(true)
    fetchSectorBrigades(zoneId)
      .then(setBrigades)
      .catch(() => setBrigades([]))
      .finally(() => setLoading(false))
  }, [zoneId])

  useEffect(() => { reload() }, [reload])

  const release = async (id: number) => {
    await updateBrigade(id, { current_sector_id: null })
    reload()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {loading ? "Загрузка…" : `${brigades.length} бригад в секторе`}
        </p>
        <Button size="sm" variant="outline" onClick={() => setAdding(true)} disabled={!sectorId}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Создать
        </Button>
      </div>
      {!loading && brigades.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Пока нет бригад в этом секторе. Назначьте свободную из вкладки «Свободные».
        </p>
      )}
      <ul className="space-y-2">
        {brigades.map((b) => (
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
              <Button size="sm" variant="ghost" onClick={() => release(b.id)}>
                <UserMinus className="h-3.5 w-3.5 mr-1" />
                Освободить
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <AddBrigadeDialog
        open={adding}
        onOpenChange={setAdding}
        onCreated={reload}
        sectorId={sectorId ?? undefined}
      />
    </div>
  )
}
