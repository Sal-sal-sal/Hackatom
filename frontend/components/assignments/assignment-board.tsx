"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { listDeadlines, assignDeadlineBrigade } from "@/lib/api/deadlines"
import { fetchBrigades } from "@/lib/api/employ"
import type { ApiBrigade, ApiDeadline } from "@/lib/api/types"

const UNASSIGNED = "__unassigned__"

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-red-500/15 text-red-500",
  medium: "bg-amber-500/15 text-amber-500",
  low: "bg-emerald-500/15 text-emerald-500",
}

export function AssignmentBoard() {
  const [deadlines, setDeadlines] = useState<ApiDeadline[]>([])
  const [brigades, setBrigades] = useState<ApiBrigade[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "assigned" | "unassigned">("all")
  const [savingId, setSavingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([listDeadlines(), fetchBrigades()])
      .then(([d, b]) => {
        if (cancelled) return
        setDeadlines(d)
        setBrigades(b)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const brigadeMap = useMemo(
    () => new Map(brigades.map((b) => [b.id, b])),
    [brigades]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return deadlines.filter((d) => {
      if (filter === "assigned" && d.brigade_id == null) return false
      if (filter === "unassigned" && d.brigade_id != null) return false
      if (q && !d.title.toLowerCase().includes(q)) return false
      return true
    })
  }, [deadlines, search, filter])

  const handleAssign = async (deadlineId: number, value: string) => {
    const brigadeId = value === UNASSIGNED ? null : Number(value)
    setSavingId(deadlineId)
    try {
      const updated = await assignDeadlineBrigade(deadlineId, brigadeId)
      setDeadlines((prev) =>
        prev.map((d) => (d.id === deadlineId ? updated : d))
      )
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">Загрузка...</div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Поиск задачи..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все задачи</SelectItem>
            <SelectItem value="unassigned">Без бригады</SelectItem>
            <SelectItem value="assigned">С бригадой</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto text-sm text-muted-foreground self-center">
          {filtered.length} из {deadlines.length}
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <Card className="p-6 text-sm text-muted-foreground">
            Нет задач по выбранному фильтру.
          </Card>
        )}
        {filtered.map((d) => {
          const current = d.brigade_id != null ? brigadeMap.get(d.brigade_id) : null
          return (
            <Card key={d.id} className="p-4 grid gap-3 md:grid-cols-[1fr_auto] items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-foreground">{d.title}</h3>
                  <Badge className={PRIORITY_COLOR[d.priority] ?? ""} variant="secondary">
                    {d.priority}
                  </Badge>
                  <Badge variant="outline">{d.status}</Badge>
                  {d.type !== "general" && <Badge variant="outline">{d.type}</Badge>}
                </div>
                {d.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{d.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Срок: {d.deadline_date}
                  {current ? ` · Бригада: ${current.name}` : " · Без бригады"}
                </p>
              </div>
              <Select
                value={d.brigade_id != null ? String(d.brigade_id) : UNASSIGNED}
                onValueChange={(v) => handleAssign(d.id, v)}
                disabled={savingId === d.id}
              >
                <SelectTrigger className="w-[260px]">
                  <SelectValue placeholder="Назначить бригаду" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>— Снять назначение —</SelectItem>
                  {brigades.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name} · {b.specialization} ({b.members_count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
