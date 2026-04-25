import { AppHeader } from "@/components/app-header"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"

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
            Interactive 3D visualization of the construction site
          </p>
        </div>

        <Card className="border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-foreground">3D site visualization</h3>
            <p className="mt-1 text-sm text-muted-foreground text-center max-w-md">
              The interactive 3D model of Almaty NPP construction site will be displayed here,
              showing real-time progress and resource allocation.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
