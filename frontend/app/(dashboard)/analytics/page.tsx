import { AppHeader } from "@/components/app-header"
import { AnalyticsKpi } from "@/components/analytics/analytics-kpi"
import { DeadlinesChart } from "@/components/analytics/deadlines-chart"
import { WorkersChart } from "@/components/analytics/workers-chart"
import { SuppliesChart } from "@/components/analytics/supplies-chart"

export default function AnalyticsPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Analytics" },
        ]}
      />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Project performance metrics and insights</p>
        </div>

        <AnalyticsKpi />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DeadlinesChart />
          <WorkersChart />
        </div>

        <SuppliesChart />
      </main>
    </>
  )
}
