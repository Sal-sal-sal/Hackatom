import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { kpiData } from "@/lib/mock-data"

export function KPICards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border bg-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total tasks</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">
                {kpiData.totalTasks.value}
              </p>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                kpiData.totalTasks.trendUp
                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                  : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
              )}
            >
              {kpiData.totalTasks.trendUp ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {kpiData.totalTasks.trend}%
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border bg-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">
                {kpiData.completed.value}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {kpiData.completed.percentage}% of total
          </p>
        </CardContent>
      </Card>

      <Card className="border bg-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In progress</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">
                {kpiData.inProgress.value}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {kpiData.inProgress.percentage}% of total
          </p>
        </CardContent>
      </Card>

      <Card className="border bg-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">
                {kpiData.overdue.value}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {kpiData.overdue.percentage}% of total
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
