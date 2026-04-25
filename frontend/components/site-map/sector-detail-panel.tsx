"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { fetchSector } from "@/lib/api/sectors"
import type { ApiSector } from "@/lib/api/types"
import { SectorBrigadesTab } from "./sector-brigades-tab"
import { SectorSuppliesTab } from "./sector-supplies-tab"
import { SectorDeadlinesTab } from "./sector-deadlines-tab"
import { SectorAvailableBrigadesTab } from "./sector-available-brigades-tab"

interface Props {
  zoneId: string
  onClose: () => void
}

export function SectorDetailPanel({ zoneId, onClose }: Props) {
  const [sector, setSector] = useState<ApiSector | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchSector(zoneId)
      .then((s) => { if (!cancelled) setSector(s) })
      .catch(() => { if (!cancelled) setSector(null) })
    return () => { cancelled = true }
  }, [zoneId])

  return (
    <Card className="border bg-card sticky top-4 flex flex-col max-h-[calc(100vh-9rem)] py-0 gap-0">
      <div className="flex items-center justify-between gap-2 border-b border-border p-4">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="h-3 w-3 rounded-full shrink-0 ring-1 ring-border"
            style={{ backgroundColor: sector?.color ?? "#64748b" }}
            aria-hidden
          />
          <div className="min-w-0">
            <p className="font-semibold truncate text-foreground">
              {sector?.title ?? zoneId}
            </p>
            <p className="text-xs text-muted-foreground truncate">{zoneId}</p>
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close panel">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="p-4 flex-1 overflow-y-auto">
        <Tabs defaultValue="brigades">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="brigades">Бригады</TabsTrigger>
            <TabsTrigger value="supplies">Поставки</TabsTrigger>
            <TabsTrigger value="deadlines">Задачи</TabsTrigger>
            <TabsTrigger value="available">Свободные</TabsTrigger>
          </TabsList>
          <TabsContent value="brigades" className="pt-3">
            <SectorBrigadesTab zoneId={zoneId} sectorId={sector?.id ?? null} />
          </TabsContent>
          <TabsContent value="supplies" className="pt-3">
            <SectorSuppliesTab zoneId={zoneId} sectorId={sector?.id ?? null} />
          </TabsContent>
          <TabsContent value="deadlines" className="pt-3">
            <SectorDeadlinesTab zoneId={zoneId} sectorId={sector?.id ?? null} />
          </TabsContent>
          <TabsContent value="available" className="pt-3">
            <SectorAvailableBrigadesTab sectorId={sector?.id ?? null} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
