"use client"

import { useEffect, useState } from "react"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Atom, Calendar, ExternalLink, UserPlus } from "lucide-react"
import { MatchScoreCircle } from "@/components/progress-indicators"
import { searchCandidates } from "@/lib/api/employ"
import { mapCandidate } from "@/lib/api/mappers"
import type { ApiCandidateSource } from "@/lib/api/types"
import type { Candidate } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  vacancy: { id: string; skills: string[]; role: string } | null
}

export function CandidatesDrawer({ open, onOpenChange, vacancy }: Props) {
  const [source, setSource] = useState<ApiCandidateSource>("hh")
  const [items, setItems] = useState<(Candidate & { url?: string | null })[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !vacancy) return
    setLoading(true); setError(null)
    searchCandidates(Number(vacancy.id), source)
      .then((data) => setItems(data.map((c) => ({
        ...mapCandidate(c, vacancy.skills),
        url: c.url,
      }))))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [open, vacancy, source])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-left">
            Candidates for {vacancy?.role || "position"}
          </SheetTitle>
          <Tabs value={source} onValueChange={(v) => setSource(v as ApiCandidateSource)}>
            <TabsList>
              <TabsTrigger value="hh" data-testid="source-hh">HH.ru</TabsTrigger>
              <TabsTrigger value="manual" data-testid="source-manual">Manual</TabsTrigger>
            </TabsList>
          </Tabs>
        </SheetHeader>

        {loading && <p className="text-sm text-muted-foreground">Searching…</p>}
        {error && <p className="text-sm text-red-600">Error: {error}</p>}

        <div className="space-y-4" data-testid="candidates-list">
          {items.map((candidate) => (
            <Card key={candidate.id} className="border bg-card">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <MatchScoreCircle score={candidate.matchScore} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                          {candidate.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">{candidate.position}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {candidate.skillsTotal.map((skill) => {
                            const isMatched = candidate.skillsMatched.includes(skill)
                            return (
                              <Badge key={skill} variant="secondary" className={cn(
                                "text-xs font-normal",
                                isMatched
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-muted text-muted-foreground",
                              )}>{skill}</Badge>
                            )
                          })}
                        </div>
                      </div>

                      {candidate.pastProjects.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Past projects</p>
                          <div className="space-y-1">
                            {candidate.pastProjects.map((project, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="text-foreground">{project.name}</span>
                                {project.isNuclearRelevant && (
                                  <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] px-1.5">
                                    <Atom className="mr-0.5 h-2.5 w-2.5" />Nuclear
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {candidate.url && (
                          <Button asChild size="sm" variant="outline" className="flex-1">
                            <a href={candidate.url} target="_blank" rel="noreferrer">
                              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />Open
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="flex-1">
                          <UserPlus className="mr-1.5 h-3.5 w-3.5" />Shortlist
                        </Button>
                        <Button size="sm" className="flex-1">
                          <Calendar className="mr-1.5 h-3.5 w-3.5" />Interview
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {!loading && items.length === 0 && (
            <p className="text-sm text-muted-foreground">No candidates found.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
