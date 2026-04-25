import { AppHeader } from "@/components/app-header"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { GanttChart } from "@/components/dashboard/gantt-chart"
import { AlertsPanel } from "@/components/dashboard/alerts-panel"
import { ActivityFeed } from "@/components/dashboard/activity-feed"

export default function DashboardPage() {
  return (
    <>
      <AppHeader breadcrumbs={[{ label: "Dashboard" }]} />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Construction overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Almaty NPP, Phase 2</p>
        </div>

        <div className="space-y-6">
          <KPICards />

          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            <GanttChart />
            <AlertsPanel />
          </div>

          <ActivityFeed />
        </div>
      </main>
    </>
  )
}
