"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { SuppliesFilters } from "@/components/supplies/supplies-filters"
import { SuppliesTable } from "@/components/supplies/supplies-table"
import { AddSupplyDialog } from "@/components/supplies/add-supply-dialog"

export default function SuppliesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const reload = () => setRefreshKey((k) => k + 1)

  return (
    <>
      <AppHeader breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Supplies" }]} />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Supplies</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage construction materials and supplier assignments</p>
        </div>
        <div className="space-y-4">
          <SuppliesFilters onAddClick={() => setDialogOpen(true)} />
          <SuppliesTable key={refreshKey} />
        </div>
      </main>

      <AddSupplyDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={reload} />
    </>
  )
}
