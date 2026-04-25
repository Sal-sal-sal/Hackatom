"use client"

import { AppHeader } from "@/components/app-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrigadesGrid } from "@/components/hr/brigades-grid"
import { VacanciesList } from "@/components/hr/vacancies-list"

export default function HRPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "HR & Teams" },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">HR & Teams</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage brigades, vacancies, and recruitment
          </p>
        </div>

        <Tabs defaultValue="brigades" className="space-y-4">
          <TabsList>
            <TabsTrigger value="brigades">Brigades</TabsTrigger>
            <TabsTrigger value="vacancies">Open vacancies</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
          </TabsList>

          <TabsContent value="brigades" className="mt-4">
            <BrigadesGrid />
          </TabsContent>

          <TabsContent value="vacancies" className="mt-4">
            <VacanciesList />
          </TabsContent>

          <TabsContent value="candidates" className="mt-4">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 py-16">
              <p className="text-muted-foreground">
                Select a vacancy to view candidates
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
