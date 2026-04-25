"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { BrigadesGrid } from "@/components/hr/brigades-grid"
import { VacanciesList } from "@/components/hr/vacancies-list"
import { AddBrigadeDialog } from "@/components/hr/add-brigade-dialog"
import { AddVacancyDialog } from "@/components/hr/add-vacancy-dialog"
import { AddEmployeeDialog } from "@/components/hr/add-employee-dialog"

export default function HRPage() {
  const [tab, setTab] = useState("brigades")
  const [brigadeOpen, setBrigadeOpen] = useState(false)
  const [vacancyOpen, setVacancyOpen] = useState(false)
  const [employeeOpen, setEmployeeOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const reload = () => setRefreshKey((k) => k + 1)

  const addButton = {
    brigades: <Button size="sm" onClick={() => setBrigadeOpen(true)}><Plus className="mr-1.5 h-4 w-4" />Add Brigade</Button>,
    vacancies: <Button size="sm" onClick={() => setVacancyOpen(true)}><Plus className="mr-1.5 h-4 w-4" />Add Vacancy</Button>,
    candidates: <Button size="sm" onClick={() => setEmployeeOpen(true)}><Plus className="mr-1.5 h-4 w-4" />Add Employee</Button>,
  }[tab] ?? null

  return (
    <>
      <AppHeader breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "HR & Teams" }]} />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">HR & Teams</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage brigades, vacancies, and recruitment</p>
          </div>
          {addButton}
        </div>

        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="brigades">Brigades</TabsTrigger>
            <TabsTrigger value="vacancies">Open vacancies</TabsTrigger>
            <TabsTrigger value="candidates">Employees</TabsTrigger>
          </TabsList>

          <TabsContent value="brigades" className="mt-4">
            <BrigadesGrid key={refreshKey} />
          </TabsContent>
          <TabsContent value="vacancies" className="mt-4">
            <VacanciesList key={refreshKey} />
          </TabsContent>
          <TabsContent value="candidates" className="mt-4">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 py-16">
              <p className="text-muted-foreground">Employee list — use "Add Employee" to register staff</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <AddBrigadeDialog open={brigadeOpen} onOpenChange={setBrigadeOpen} onCreated={reload} />
      <AddVacancyDialog open={vacancyOpen} onOpenChange={setVacancyOpen} onCreated={reload} />
      <AddEmployeeDialog open={employeeOpen} onOpenChange={setEmployeeOpen} onCreated={reload} />
    </>
  )
}
