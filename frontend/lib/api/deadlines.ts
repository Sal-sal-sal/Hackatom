import { apiFetch } from "./client"
import type { ApiDeadline, ApiKanbanBoard, ApiKpi } from "./types"

export const fetchKanban = () => apiFetch<ApiKanbanBoard>("/deadlines/kanban")

export const fetchDashboardKpi = () => apiFetch<ApiKpi>("/deadlines/dashboard")

export const fetchDeadlineAlerts = () => apiFetch<ApiDeadline[]>("/deadlines/alerts")

export const listDeadlines = () => apiFetch<ApiDeadline[]>("/deadlines")

export const createDeadline = (data: {
  title: string; description?: string; type: string; priority: string
  complexity: string; start_date?: string; deadline_date: string
  sector_id?: number | null
}) => apiFetch<ApiDeadline>("/deadlines", { method: "POST", body: JSON.stringify(data) })

export const assignDeadlineBrigade = (deadlineId: number, brigadeId: number | null) =>
  apiFetch<ApiDeadline>(`/deadlines/${deadlineId}`, {
    method: "PATCH",
    body: JSON.stringify({ brigade_id: brigadeId }),
  })
