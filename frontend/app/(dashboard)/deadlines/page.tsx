"use client"

import { AppHeader } from "@/components/app-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KanbanBoard } from "@/components/deadlines/kanban-board"
import { DeadlinesList } from "@/components/deadlines/deadlines-list"
import { DeadlinesCalendar } from "@/components/deadlines/deadlines-calendar"
import { LayoutGrid, List, CalendarDays } from "lucide-react"

export default function DeadlinesPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Deadlines" },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Deadlines</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track and manage task deadlines across all departments
          </p>
        </div>

        <Tabs defaultValue="kanban" className="space-y-4">
          <TabsList>
            <TabsTrigger value="kanban" className="gap-1.5">
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-1.5">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1.5">
              <CalendarDays className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-4">
            <KanbanBoard />
          </TabsContent>

          <TabsContent value="list" className="mt-4">
            <DeadlinesList />
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <DeadlinesCalendar />
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
