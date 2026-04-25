"use client"

import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"
import { getDaysUntilDeadline, formatDate } from "@/lib/mock-data"

interface TaskProgressBarProps {
  progress: number
  className?: string
}

export function TaskProgressBar({ progress, className }: TaskProgressBarProps) {
  const getColor = () => {
    if (progress >= 100) return "bg-green-500"
    if (progress >= 50) return "bg-amber-500"
    return "bg-primary"
  }

  return (
    <div className={cn("h-1.5 w-full rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-all", getColor())}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  )
}

interface DeadlineIndicatorProps {
  deadline: string
  className?: string
}

export function DeadlineIndicator({ deadline, className }: DeadlineIndicatorProps) {
  const daysUntil = getDaysUntilDeadline(deadline)
  
  const getColor = () => {
    if (daysUntil < 0) return "text-red-600 dark:text-red-400"
    if (daysUntil <= 7) return "text-amber-600 dark:text-amber-400"
    return "text-muted-foreground"
  }

  return (
    <div className={cn("flex items-center gap-1.5 text-sm", getColor(), className)}>
      <Calendar className="h-3.5 w-3.5" />
      <span>{formatDate(deadline)}</span>
    </div>
  )
}

interface MatchScoreCircleProps {
  score: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function MatchScoreCircle({ score, size = "md", className }: MatchScoreCircleProps) {
  const getColor = () => {
    if (score >= 70) return "text-green-500"
    if (score >= 40) return "text-amber-500"
    return "text-red-500"
  }

  const getStrokeColor = () => {
    if (score >= 70) return "stroke-green-500"
    if (score >= 40) return "stroke-amber-500"
    return "stroke-red-500"
  }

  const sizes = {
    sm: { container: "h-10 w-10", text: "text-xs", strokeWidth: 3 },
    md: { container: "h-[60px] w-[60px]", text: "text-sm font-semibold", strokeWidth: 4 },
    lg: { container: "h-20 w-20", text: "text-lg font-bold", strokeWidth: 5 },
  }

  const { container, text, strokeWidth } = sizes[size]
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className={cn("relative", container, className)}>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-500", getStrokeColor())}
        />
      </svg>
      <div className={cn("absolute inset-0 flex items-center justify-center", text, getColor())}>
        {score}%
      </div>
    </div>
  )
}
