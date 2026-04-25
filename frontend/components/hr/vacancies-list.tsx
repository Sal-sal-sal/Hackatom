"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { PriorityBadge } from "@/components/badges"
import { DeadlineIndicator } from "@/components/progress-indicators"
import { fetchVacancies } from "@/lib/api/employ"
import { mapVacancy } from "@/lib/api/mappers"
import type { Vacancy } from "@/lib/mock-data"
import { CandidatesDrawer } from "./candidates-drawer"

export function VacanciesList() {
  const [items, setItems] = useState<(Vacancy & { skills: string[] })[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<{ id: string; skills: string[]; role: string } | null>(null)

  useEffect(() => {
    fetchVacancies()
      .then((data) => setItems(data.map(mapVacancy)))
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="text-sm text-red-600">Failed to load vacancies: {error}</p>
  if (!items) return <p className="text-sm text-muted-foreground">Loading vacancies…</p>

  return (
    <>
      <div data-testid="vacancies-list" className="space-y-4">
        {items.map((vacancy) => (
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
                  data-testid={`find-candidate-${vacancy.id}`}
                  onClick={() => setSelected({ id: vacancy.id, skills: vacancy.skills, role: vacancy.role })}
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
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        vacancy={selected}
      />
    </>
  )
}
