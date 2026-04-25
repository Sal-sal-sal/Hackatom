"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createVacancy } from "@/lib/api/employ"

interface Props { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }

const today = new Date().toISOString().slice(0, 10)
const EMPTY = { role: "", required_skills: "", priority: "medium", complexity: "medium", hire_by_date: today }

export function AddVacancyDialog({ open, onOpenChange, onCreated }: Props) {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))
  const setSel = (k: keyof typeof EMPTY) => (v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const skills = form.required_skills.split(",").map((s) => s.trim()).filter(Boolean)
      await createVacancy({ ...form, required_skills: skills, status: "todo" })
      setForm(EMPTY); onOpenChange(false); onCreated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error")
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Vacancy</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Role</Label>
            <Input required value={form.role} onChange={set("role")} placeholder="Senior Welder" />
          </div>
          <div className="space-y-1">
            <Label>Required skills <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
            <Input value={form.required_skills} onChange={set("required_skills")} placeholder="TIG, MIG, nuclear" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={setSel("priority")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Complexity</Label>
              <Select value={form.complexity} onValueChange={setSel("complexity")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="simple">Simple</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Hire by</Label>
            <Input type="date" required value={form.hire_by_date} onChange={set("hire_by_date")} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Add Vacancy"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
