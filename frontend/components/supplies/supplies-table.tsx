"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { PriorityBadge, ComplexityBadge, StatusBadge } from "@/components/badges"
import { TaskProgressBar, DeadlineIndicator } from "@/components/progress-indicators"
import { fetchSupplies, fetchSuppliers, findSupplier, assignSupplier } from "@/lib/api/supplies"
import { mapSupply } from "@/lib/api/mappers"
import type { ApiSupplier, ApiSupplierMatch } from "@/lib/api/types"
import type { Supply } from "@/lib/mock-data"

export function SuppliesTable() {
  const [items, setItems] = useState<Supply[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [matchOpenFor, setMatchOpenFor] = useState<number | null>(null)
  const [matches, setMatches] = useState<ApiSupplierMatch[]>([])

  const reload = async () => {
    const [supplies, suppliers] = await Promise.all([fetchSupplies(), fetchSuppliers()])
    const byId = new Map<number, ApiSupplier>(suppliers.map((s) => [s.id, s]))
    setItems(supplies.map((s) => mapSupply(s, s.supplier_id ? byId.get(s.supplier_id)?.name ?? null : null)))
  }

  useEffect(() => { reload().catch((e) => setError(e.message)) }, [])

  const onFindSupplier = async (supplyId: number) => {
    setMatchOpenFor(supplyId)
    setMatches(await findSupplier(supplyId))
  }

  const onAssign = async (supplierId: number) => {
    if (matchOpenFor == null) return
    await assignSupplier(matchOpenFor, supplierId)
    setMatchOpenFor(null)
    await reload()
  }

  if (error) return <p className="text-sm text-red-600">Failed to load supplies: {error}</p>
  if (!items) return <p className="text-sm text-muted-foreground">Loading supplies…</p>

  return (
    <>
    <div data-testid="supplies-table" className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[200px]">Material</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Complexity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[120px]">Progress</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((supply) => (
            <TableRow key={supply.id} className="transition-colors hover:bg-muted/50">
              <TableCell className="font-medium">{supply.material}</TableCell>
              <TableCell className="text-muted-foreground">{supply.quantity}</TableCell>
              <TableCell>
                {supply.supplier ? (
                  <span className="text-foreground">{supply.supplier}</span>
                ) : (
                  <Button variant="outline" size="sm" className="h-7 text-xs"
                          data-testid={`find-supplier-${supply.id}`}
                          onClick={() => onFindSupplier(Number(supply.id))}>
                    <Search className="mr-1 h-3 w-3" />Find supplier
                  </Button>
                )}
              </TableCell>
              <TableCell><PriorityBadge priority={supply.priority} /></TableCell>
              <TableCell><ComplexityBadge complexity={supply.complexity} /></TableCell>
              <TableCell><StatusBadge status={supply.status} /></TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <TaskProgressBar progress={supply.progress} className="w-16" />
                  <span className="text-xs text-muted-foreground">{supply.progress}%</span>
                </div>
              </TableCell>
              <TableCell><DeadlineIndicator deadline={supply.deadline} /></TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View details</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onFindSupplier(Number(supply.id))}>
                      Find supplier
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    <Dialog open={matchOpenFor !== null} onOpenChange={(o) => !o && setMatchOpenFor(null)}>
      <DialogContent>
        <DialogHeader><DialogTitle>Suggested suppliers</DialogTitle></DialogHeader>
        <div className="space-y-2" data-testid="supplier-matches">
          {matches.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded border p-3">
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">
                  {m.location} • rating {m.rating} • score {m.score}
                  {m.nuclear_certified && " • nuclear-certified"}
                </p>
              </div>
              <Button size="sm" onClick={() => onAssign(m.id)}>Assign</Button>
            </div>
          ))}
          {matches.length === 0 && <p className="text-sm text-muted-foreground">No matches.</p>}
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
