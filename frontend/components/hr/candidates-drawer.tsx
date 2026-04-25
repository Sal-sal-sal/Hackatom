"use client"

import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Atom, Calendar, BookmarkCheck, CheckCircle2, Send } from "lucide-react"
import { MatchScoreCircle } from "@/components/progress-indicators"
import { searchAllCandidates } from "@/lib/api/employ"
import { mapCandidate } from "@/lib/api/mappers"
import type { Candidate } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  vacancy: { id: string; skills: string[]; role: string } | null
}

function Toast({ name, onDone }: { name: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 rounded-lg border border-green-200 bg-white dark:bg-zinc-900 dark:border-green-800 px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
      <span className="text-sm font-medium text-foreground">
        <span className="text-green-700 dark:text-green-400">{name}</span> added to Shortlist
      </span>
    </div>
  )
}

export function CandidatesDrawer({ open, onOpenChange, vacancy }: Props) {
  const [items, setItems] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !vacancy) return
    setLoading(true); setError(null)
    searchAllCandidates(Number(vacancy.id))
      .then((data) => setItems(data.map((c) => mapCandidate(c, vacancy.skills))))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [open, vacancy])

  const handleShortlist = (name: string) => setToast(name)

  const handleInterview = (telegram: string | null) => {
    if (telegram) {
      const handle = telegram.startsWith("@") ? telegram.slice(1) : telegram
      window.open(`https://t.me/${handle}`, "_blank")
    }
  }

  return (
    <>
      {toast && <Toast name={toast} onDone={() => setToast(null)} />}

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-left">
              Candidates for {vacancy?.role || "position"}
            </SheetTitle>
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
                          {candidate.telegram && (
                            <p className="text-xs text-blue-500">{candidate.telegram}</p>
                          )}
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
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleShortlist(candidate.name)}
                          >
                            <BookmarkCheck className="mr-1.5 h-3.5 w-3.5" />Shortlist
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            disabled={!candidate.telegram}
                            onClick={() => handleInterview(candidate.telegram)}
                            title={candidate.telegram ? `Open Telegram: ${candidate.telegram}` : "No Telegram available"}
                          >
                            <Send className="mr-1.5 h-3.5 w-3.5" />
                            {candidate.telegram ? "Telegram" : "No Telegram"}
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
    </>
  )
}
