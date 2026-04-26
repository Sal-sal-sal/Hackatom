"use client"

import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = {
  todo:        "#60a5fa", // bright blue
  in_progress: "#f87171", // muted red
  done:        "#facc15", // yellow
}

const DATA = [
  { month: "Sep", todo: 42, in_progress:  6, done:  2 },
  { month: "Oct", todo: 48, in_progress: 12, done:  7 },
  { month: "Nov", todo: 51, in_progress: 19, done: 14 },
  { month: "Dec", todo: 47, in_progress: 26, done: 23 },
  { month: "Jan", todo: 44, in_progress: 31, done: 35 },
  { month: "Feb", todo: 39, in_progress: 34, done: 48 },
  { month: "Mar", todo: 33, in_progress: 36, done: 62 },
  { month: "Apr", todo: 27, in_progress: 33, done: 78 },
]

const TOTAL = DATA[DATA.length - 1].todo + DATA[DATA.length - 1].in_progress + DATA[DATA.length - 1].done

export function SuppliesChart() {
  return (
    <Card className="border bg-card transition-colors duration-200 hover:border-primary/50 hover:bg-foreground/[0.03] dark:hover:bg-foreground/[0.04]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-foreground/90">Supply Chain — Progress Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DATA} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <Tooltip
                cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--popover-foreground)", fontWeight: 500 }}
                itemStyle={{ color: "var(--popover-foreground)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8, color: "var(--foreground)" }}
                iconType="circle"
                formatter={(v) => <span style={{ color: "var(--foreground)" }}>{v}</span>}
              />
              <Line type="monotone" dataKey="todo"        name="To Do"       stroke={COLORS.todo}        strokeWidth={2.5} dot={{ r: 3, fill: COLORS.todo,        strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--background)" }} filter="url(#glow)" />
              <Line type="monotone" dataKey="in_progress" name="In Progress" stroke={COLORS.in_progress} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.in_progress, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--background)" }} filter="url(#glow)" />
              <Line type="monotone" dataKey="done"        name="Completed"   stroke={COLORS.done}        strokeWidth={2.5} dot={{ r: 3, fill: COLORS.done,        strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--background)" }} filter="url(#glow)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          Total supplies tracked: <span className="font-medium text-foreground/90">{TOTAL}</span>
          <span className="mx-2 text-border">·</span>
          Trend: <span className="font-medium text-foreground/90">+{DATA[DATA.length - 1].done - DATA[0].done}</span> completed in 8 months
        </p>
      </CardContent>
    </Card>
  )
}
