"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createSupply } from "@/lib/api/supplies"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: () => void
  sectorId?: number
}

const today = new Date().toISOString().slice(0, 10)
const EMPTY = {
  material_name: "", quantity: "1", unit: "ton",
  priority: "medium", complexity: "medium", deadline: today,
  nuclear_grade_required: false, note: "",
}

export function AddSupplyDialog({ open, onOpenChange, onCreated, sectorId }: Props) {
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
      await createSupply({
        material_name: form.material_name,
        quantity: Number(form.quantity),
        unit: form.unit,
        priority: form.priority,
        complexity: form.complexity,
        deadline: form.deadline,
        nuclear_grade_required: form.nuclear_grade_required,
        note: form.note,
        sector_id: sectorId ?? null,
      })
      setForm(EMPTY); onOpenChange(false); onCreated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error")
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Supply</DialogTitle><DialogDescription>Fill in the details to create a new supply request.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Material name</Label>
            <Input required value={form.material_name} onChange={set("material_name")} placeholder="Reinforced steel A500C" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Quantity</Label>
              <Input type="number" min={0} step="any" required value={form.quantity} onChange={set("quantity")} />
            </div>
            <div className="space-y-1">
              <Label>Unit</Label>
              <Input required value={form.unit} onChange={set("unit")} placeholder="ton / m / unit" />
            </div>
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
            <Label>Deadline</Label>
            <Input type="date" required value={form.deadline} onChange={set("deadline")} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="nuclear"
              checked={form.nuclear_grade_required}
              onCheckedChange={(v) => setForm((f) => ({ ...f, nuclear_grade_required: !!v }))}
            />
            <Label htmlFor="nuclear">Nuclear grade required</Label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Add Supply"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
