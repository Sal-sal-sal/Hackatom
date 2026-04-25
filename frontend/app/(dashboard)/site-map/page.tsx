import { AppHeader } from "@/components/app-header"
import { SectorAwareLayout } from "@/components/site-map/sector-aware-layout"

export default function SiteMapPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Site map 3D" },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Site map 3D</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Кликните на сектор, чтобы увидеть назначенные бригады, поставки и задачи
          </p>
        </div>

        <SectorAwareLayout />
      </main>
    </>
  )
}
