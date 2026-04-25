"use client"

import { MoreHorizontal, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PriorityBadge, ComplexityBadge, StatusBadge } from "@/components/badges"
import { TaskProgressBar, DeadlineIndicator } from "@/components/progress-indicators"
import { supplies } from "@/lib/mock-data"

export function SuppliesTable() {
  return (
    <div className="rounded-lg border border-border bg-card">
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
          {supplies.map((supply) => (
            <TableRow
              key={supply.id}
              className="transition-colors hover:bg-muted/50"
            >
              <TableCell className="font-medium">{supply.material}</TableCell>
              <TableCell className="text-muted-foreground">{supply.quantity}</TableCell>
              <TableCell>
                {supply.supplier ? (
                  <span className="text-foreground">{supply.supplier}</span>
                ) : (
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <Search className="mr-1 h-3 w-3" />
                    Find supplier
                  </Button>
                )}
              </TableCell>
              <TableCell>
                <PriorityBadge priority={supply.priority} />
              </TableCell>
              <TableCell>
                <ComplexityBadge complexity={supply.complexity} />
              </TableCell>
              <TableCell>
                <StatusBadge status={supply.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <TaskProgressBar progress={supply.progress} className="w-16" />
                  <span className="text-xs text-muted-foreground">{supply.progress}%</span>
                </div>
              </TableCell>
              <TableCell>
                <DeadlineIndicator deadline={supply.deadline} />
              </TableCell>
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
                    <DropdownMenuItem>Edit supply</DropdownMenuItem>
                    <DropdownMenuItem>Update progress</DropdownMenuItem>
                    <DropdownMenuItem>Assign supplier</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
