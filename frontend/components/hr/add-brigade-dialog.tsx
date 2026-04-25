"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Check } from "lucide-react"
import { createBrigade, fetchEmployees, assignEmployeeBrigade } from "@/lib/api/employ"
import type { ApiEmployee } from "@/lib/api/types"
import { cn } from "@/lib/utils"

interface Props { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("")
}

export function AddBrigadeDialog({ open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [employees, setEmployees] = useState<ApiEmployee[]>([])
  const [leaderId, setLeaderId] = useState<number | null>(null)
  const [memberIds, setMemberIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    fetchEmployees().then(setEmployees).catch(() => setEmployees([]))
  }, [open])

  const toggleMember = (id: number) =>
    setMemberIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const reset = () => {
    setName(""); setSpecialization(""); setLeaderId(null); setMemberIds(new Set()); setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leaderId) { setError("Select a brigade leader"); return }
    setLoading(true); setError(null)
    try {
      const leader = employees.find((emp) => emp.id === leaderId)!
      const allMemberIds = Array.from(new Set([leaderId, ...memberIds]))
      const brigade = await createBrigade({
        name,
        leader_name: leader.full_name,
        members_count: allMemberIds.length,
        specialization,
      })
      await Promise.all(allMemberIds.map((id) => assignEmployeeBrigade(id, brigade.id)))
      reset(); onOpenChange(false); onCreated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error")
    } finally { setLoading(false) }
  }

  const unassigned = employees.filter((e) => e.brigade_id === null || e.brigade_id === undefined)

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Brigade</DialogTitle>
          <DialogDescription>Pick a leader and members from unassigned employees.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Brigade name</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Brigade Alpha" />
          </div>
          <div className="space-y-1">
            <Label>Specialization</Label>
            <Input required value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="Welding / Electrical…" />
          </div>

          <div className="space-y-2">
            <Label>Brigade leader <span className="text-red-500">*</span></Label>
            {unassigned.length === 0
              ? <p className="text-xs text-muted-foreground">No unassigned employees. Add employees first.</p>
              : (
                <div className="max-h-40 overflow-y-auto rounded-md border border-border divide-y divide-border">
                  {unassigned.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => setLeaderId(emp.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50",
                        leaderId === emp.id && "bg-primary/10",
                      )}
                    >
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials(emp.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{emp.full_name}</p>
                        <p className="text-xs text-muted-foreground">{emp.position} · {emp.experience_years}y exp</p>
                      </div>
                      {leaderId === emp.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
          </div>

          <div className="space-y-2">
            <Label>Members <span className="text-muted-foreground text-xs">(optional, multi-select)</span></Label>
            {unassigned.length === 0
              ? null
              : (
                <div className="max-h-40 overflow-y-auto rounded-md border border-border divide-y divide-border">
                  {unassigned
                    .filter((emp) => emp.id !== leaderId)
                    .map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => toggleMember(emp.id)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50",
                          memberIds.has(emp.id) && "bg-primary/10",
                        )}
                      >
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials(emp.full_name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{emp.full_name}</p>
                          <p className="text-xs text-muted-foreground">{emp.position} · {emp.experience_years}y exp</p>
                        </div>
                        {memberIds.has(emp.id) && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    ))}
                </div>
              )}
            {leaderId && (
              <p className="text-xs text-muted-foreground">
                Total: {1 + memberIds.size} member{memberIds.size !== 0 ? "s" : ""}
              </p>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Create Brigade"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
