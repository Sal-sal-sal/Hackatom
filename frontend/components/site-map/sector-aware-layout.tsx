"use client"

import { useEffect, useRef, useState } from "react"
import { useSidebar } from "@/components/ui/sidebar"
import { NppModelViewer } from "@/components/3d/npp-model-viewer"
import { SectorDetailPanel } from "./sector-detail-panel"

export function SectorAwareLayout() {
  const [zoneId, setZoneId] = useState<string | null>(null)
  const { open, setOpen } = useSidebar()
  const prevOpenRef = useRef<boolean | null>(null)

  useEffect(() => {
    const isPanelOpen = zoneId !== null
    if (isPanelOpen && prevOpenRef.current === null) {
      prevOpenRef.current = open
      setOpen(false)
    }
    if (!isPanelOpen && prevOpenRef.current !== null) {
      setOpen(prevOpenRef.current)
      prevOpenRef.current = null
    }
  }, [zoneId, open, setOpen])

  return (
    <div className={zoneId ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_440px]" : ""}>
      <NppModelViewer
        onZoneSelect={setZoneId}
        hideInspector={zoneId !== null}
      />
      {zoneId && <SectorDetailPanel zoneId={zoneId} onClose={() => setZoneId(null)} />}
    </div>
  )
}
