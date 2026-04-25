"use client"

import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props { onAddClick?: () => void }

export function SuppliesFilters({ onAddClick }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select defaultValue="all-status">
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-status">All statuses</SelectItem>
          <SelectItem value="not-started">Not started</SelectItem>
          <SelectItem value="in-progress">In progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="all-priority">
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-priority">All priorities</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="all-complexity">
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Complexity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-complexity">All complexity</SelectItem>
          <SelectItem value="hard">Hard</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="simple">Simple</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search materials..."
          className="pl-8"
        />
      </div>

      <Button className="ml-auto" onClick={onAddClick}>
        <Plus className="mr-1.5 h-4 w-4" />
        Add supply
      </Button>
    </div>
  )
}
