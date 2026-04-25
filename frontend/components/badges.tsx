import { cn } from "@/lib/utils"
import type { Priority, Complexity, Status } from "@/lib/mock-data"

interface BadgeProps {
  className?: string
}

interface PriorityBadgeProps extends BadgeProps {
  priority: Priority
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const styles = {
    high: "bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    medium: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    low: "bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  }

  const labels = {
    high: "High",
    medium: "Medium",
    low: "Low",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        styles[priority],
        className
      )}
    >
      {labels[priority]}
    </span>
  )
}

interface ComplexityBadgeProps extends BadgeProps {
  complexity: Complexity
}

export function ComplexityBadge({ complexity, className }: ComplexityBadgeProps) {
  const styles = {
    hard: "bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    medium: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    simple: "bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  }

  const labels = {
    hard: "Hard",
    medium: "Medium",
    simple: "Simple",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        styles[complexity],
        className
      )}
    >
      {labels[complexity]}
    </span>
  )
}

interface StatusBadgeProps extends BadgeProps {
  status: Status
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    "not-started": "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    "in-progress": "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    completed: "bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  }

  const labels = {
    "not-started": "Not started",
    "in-progress": "In progress",
    completed: "Completed",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  )
}
