"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchActivities } from "@/lib/api/dashboard"
import { formatDateTime } from "@/lib/mock-data"
import type { ApiActivity } from "@/lib/api/types"

export function ActivityFeed() {
  const [items, setItems] = useState<ApiActivity[] | null>(null)

  useEffect(() => { fetchActivities().then(setItems).catch(() => setItems([])) }, [])

  return (
    <Card className="border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {!items ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="relative" data-testid="activity-feed">
            <div className="absolute left-[7px] top-2 h-[calc(100%-16px)] w-px bg-border" />
            <div className="space-y-4">
              {items.map((activity) => (
                <div key={activity.id} className="relative flex gap-3 pl-6">
                  <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity.user}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>{" "}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDateTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
