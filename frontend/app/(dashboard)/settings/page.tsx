"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, Atom, Users, Package, BarChart3, MapPin } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const THEMES = [
  { id: "light",  label: "Light",  icon: Sun,     hint: "Bright UI for daytime" },
  { id: "dark",   label: "Dark",   icon: Moon,    hint: "Easier on the eyes at night" },
  { id: "system", label: "System", icon: Monitor, hint: "Follow OS preference" },
] as const

const FEATURES = [
  { icon: Users,     title: "HR & Brigades",   text: "Workforce planning, brigade composition, HH.ru vacancy sync" },
  { icon: Package,   title: "Supplies",        text: "Materials tracking with nuclear-grade certification matching" },
  { icon: BarChart3, title: "Analytics",       text: "KPIs, deadline forecasts, supply chain progress over time" },
  { icon: MapPin,    title: "Site Map (3D)",   text: "Interactive NPP layout with sector status and assignments" },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <>
      <AppHeader breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Settings" }]} />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground/90">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configure appearance and review what this platform does</p>
        </div>

        <Card className="border bg-card transition-colors duration-200 hover:border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-foreground/90">Appearance</CardTitle>
            <p className="text-xs text-muted-foreground">Choose how the dashboard should look</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {THEMES.map((t) => {
                const Icon = t.icon
                const active = mounted && theme === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "group flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all duration-200",
                      "hover:-translate-y-0.5 hover:shadow-md hover:bg-foreground/[0.03] dark:hover:bg-foreground/[0.04]",
                      active
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-foreground",
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-medium text-foreground/90">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.hint}</div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card transition-colors duration-200 hover:border-primary/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Atom className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-medium text-foreground/90">About the project</CardTitle>
                <p className="text-xs text-muted-foreground">Nuclear power plant construction management platform</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              An integrated dashboard for coordinating large-scale NPP construction projects.
              It connects HR, supplies, deadlines and on-site progress in one place — so brigade leads,
              procurement and management work off the same source of truth, with full traceability for
              nuclear-grade requirements.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURES.map((f) => {
                const Icon = f.icon
                return (
                  <div
                    key={f.title}
                    className="flex gap-3 rounded-lg border border-border bg-background/40 p-3 transition-colors hover:border-primary/40 hover:bg-foreground/[0.03] dark:hover:bg-foreground/[0.04]"
                  >
                    <Icon className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                    <div>
                      <div className="text-sm font-medium text-foreground/90">{f.title}</div>
                      <div className="text-xs text-muted-foreground">{f.text}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground border-t border-border">
              <span className="pt-2">Stack:</span>
              <span className="pt-2 font-medium text-foreground/80">Next.js · FastAPI · Recharts · Three.js</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
