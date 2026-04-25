import { apiFetch } from "./client"
import type { ApiActivity, ApiAlert, ApiGanttResponse, ApiKpi } from "./types"

export const fetchKpi = () => apiFetch<ApiKpi>("/dashboard/kpi")
export const fetchGantt = () => apiFetch<ApiGanttResponse>("/dashboard/gantt")
export const fetchAlerts = () => apiFetch<ApiAlert[]>("/dashboard/alerts")
export const fetchActivities = (limit = 10) =>
  apiFetch<ApiActivity[]>(`/dashboard/activities?limit=${limit}`)
