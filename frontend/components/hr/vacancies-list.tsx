"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { PriorityBadge } from "@/components/badges"
import { DeadlineIndicator } from "@/components/progress-indicators"
import { vacancies } from "@/lib/mock-data"
import { CandidatesDrawer } from "./candidates-drawer"

export function VacanciesList() {
  const [selectedVacancy, setSelectedVacancy] = useState<string | null>(null)

  return (
    <>
      <div className="space-y-4">
        {vacancies.map((vacancy) => (
          <Card key={vacancy.id} className="border bg-card">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-medium text-foreground">
                      {vacancy.role}
                    </h3>
                    <PriorityBadge priority={vacancy.priority} />
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {vacancy.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-muted text-muted-foreground text-xs font-normal"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Hire by:</span>
                    <DeadlineIndicator deadline={vacancy.hireBy} />
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setSelectedVacancy(vacancy.id)}
                >
                  <Search className="mr-1.5 h-4 w-4" />
                  Find candidate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CandidatesDrawer
        open={selectedVacancy !== null}
        onOpenChange={(open) => !open && setSelectedVacancy(null)}
        vacancyId={selectedVacancy}
      />
    </>
  )
}
