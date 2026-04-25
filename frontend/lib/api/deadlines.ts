import { apiFetch } from "./client"
import type { ApiDeadline, ApiKanbanBoard, ApiKpi } from "./types"

export const fetchKanban = () => apiFetch<ApiKanbanBoard>("/deadlines/kanban")

export const fetchDashboardKpi = () => apiFetch<ApiKpi>("/deadlines/dashboard")

export const fetchDeadlineAlerts = () => apiFetch<ApiDeadline[]>("/deadlines/alerts")

export const listDeadlines = () => apiFetch<ApiDeadline[]>("/deadlines")
