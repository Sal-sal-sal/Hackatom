"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrigade } from "@/lib/api/employ"

interface Props { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }

const EMPTY = { name: "", leader_name: "", members_count: "5", specialization: "" }

export function AddBrigadeDialog({ open, onOpenChange, onCreated }: Props) {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      await createBrigade({ ...form, members_count: Number(form.members_count) })
      setForm(EMPTY); onOpenChange(false); onCreated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error")
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Brigade</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input required value={form.name} onChange={set("name")} placeholder="Brigade Alpha" />
          </div>
          <div className="space-y-1">
            <Label>Leader name</Label>
            <Input required value={form.leader_name} onChange={set("leader_name")} placeholder="Ivan Petrov" />
          </div>
          <div className="space-y-1">
            <Label>Members count</Label>
            <Input type="number" min={1} required value={form.members_count} onChange={set("members_count")} />
          </div>
          <div className="space-y-1">
            <Label>Specialization</Label>
            <Input required value={form.specialization} onChange={set("specialization")} placeholder="Welding" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Add Brigade"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
