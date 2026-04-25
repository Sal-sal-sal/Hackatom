"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createEmployee } from "@/lib/api/employ"

interface Props { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }

const EMPTY = { full_name: "", position: "", experience_years: "0", skills: "" }

export function AddEmployeeDialog({ open, onOpenChange, onCreated }: Props) {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      await createEmployee({
        full_name: form.full_name,
        position: form.position,
        experience_years: Number(form.experience_years),
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        source: "manual",
      })
      setForm(EMPTY); onOpenChange(false); onCreated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error")
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>Fill in the details to register a new employee.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Full name</Label>
            <Input required value={form.full_name} onChange={set("full_name")} placeholder="Anna Smirnova" />
          </div>
          <div className="space-y-1">
            <Label>Position</Label>
            <Input required value={form.position} onChange={set("position")} placeholder="Welder" />
          </div>
          <div className="space-y-1">
            <Label>Experience (years)</Label>
            <Input type="number" min={0} value={form.experience_years} onChange={set("experience_years")} />
          </div>
          <div className="space-y-1">
            <Label>Skills <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
            <Input value={form.skills} onChange={set("skills")} placeholder="TIG, MIG, nuclear" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Add Employee"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
