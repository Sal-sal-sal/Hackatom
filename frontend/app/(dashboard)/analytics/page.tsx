import { AppHeader } from "@/components/app-header"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Analytics" },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Project performance metrics and insights
          </p>
        </div>

        <Card className="border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-foreground">Analytics dashboard</h3>
            <p className="mt-1 text-sm text-muted-foreground text-center max-w-md">
              Detailed analytics including cost tracking, timeline adherence, 
              resource utilization, and predictive insights will be displayed here.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
