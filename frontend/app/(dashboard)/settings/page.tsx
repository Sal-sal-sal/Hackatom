import { AppHeader } from "@/components/app-header"
import { Card, CardContent } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Settings" },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure your dashboard and notification preferences
          </p>
        </div>

        <Card className="border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-foreground">Settings panel</h3>
            <p className="mt-1 text-sm text-muted-foreground text-center max-w-md">
              User preferences, notification settings, team management, 
              and system configuration options will be available here.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
