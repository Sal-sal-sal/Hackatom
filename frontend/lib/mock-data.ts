// Mock data for NPP Construction Management Dashboard

export type Priority = "high" | "medium" | "low"
export type Complexity = "hard" | "medium" | "simple"
export type Status = "not-started" | "in-progress" | "completed"
export type TaskType = "supply" | "hr"

export interface Supply {
  id: string
  material: string
  quantity: string
  supplier: string | null
  priority: Priority
  complexity: Complexity
  status: Status
  progress: number
  deadline: string
}

export interface Brigade {
  id: string
  name: string
  leader: {
    name: string
    avatar: string
  }
  memberCount: number
  currentTask: string
  progress: number
  deadline: string
  sectorTitle?: string | null
  sectorColor?: string | null
}

export interface Vacancy {
  id: string
  role: string
  skills: string[]
  priority: Priority
  hireBy: string
}

export interface Candidate {
  id: string
  name: string
  position: string
  avatar: string
  matchScore: number
  skillsMatched: string[]
  skillsTotal: string[]
  telegram: string | null
  pastProjects: {
    name: string
    isNuclearRelevant: boolean
  }[]
}

export interface Task {
  id: string
  title: string
  priority: Priority
  complexity: Complexity
  deadline: string
  progress: number
  type: TaskType
  status: Status
}

export interface Activity {
  id: string
  action: string
  target: string
  user: string
  timestamp: string
}

export interface Alert {
  id: string
  title: string
  description: string
  severity: "critical" | "warning"
  timestamp: string
}

export interface GanttTask {
  id: string
  name: string
  startDay: number
  duration: number
  progress: number
  category: "foundation" | "electrical" | "structural" | "safety"
}

// Helper functions
export function getDaysUntilDeadline(deadline: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

