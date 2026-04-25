"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createDeadline } from "@/lib/api/deadlines"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: () => void
  defaultStatus?: string
  sectorId?: number
}

const today = new Date().toISOString().slice(0, 10)
const EMPTY = {
  title: "", type: "general", priority: "medium",
  complexity: "medium", start_date: today, deadline_date: today, description: "",
}

export function AddDeadlineDialog({ open, onOpenChange, onCreated, defaultStatus = "todo", sectorId }: Props) {
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
      await createDeadline({
        ...form, status: defaultStatus, sector_id: sectorId ?? null,
      } as Parameters<typeof createDeadline>[0])
      setForm(EMPTY); onOpenChange(false); onCreated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error")
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Task</DialogTitle><DialogDescription>Fill in the details to create a new task.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input required value={form.title} onChange={set("title")} placeholder="Pour foundation block A" />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Input value={form.description} onChange={set("description")} placeholder="Optional details…" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={setSel("type")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="supply">Supply</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Start date</Label>
              <Input type="date" required value={form.start_date} onChange={set("start_date")} />
            </div>
            <div className="space-y-1">
              <Label>Deadline date</Label>
              <Input type="date" required value={form.deadline_date} onChange={set("deadline_date")} />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Add Task"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
