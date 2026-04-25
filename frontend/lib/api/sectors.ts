import { apiFetch } from "./client"
import type {
  ApiSector, ApiSectorWithCounts, ApiBrigade, ApiSupply, ApiDeadline,
} from "./types"

export const fetchSectors = (withCounts = false) =>
  apiFetch<ApiSector[] | ApiSectorWithCounts[]>(
    `/sectors${withCounts ? "?with_counts=true" : ""}`,
  )

export const fetchSector = (zoneId: string) =>
  apiFetch<ApiSector>(`/sectors/${encodeURIComponent(zoneId)}`)

export const fetchSectorBrigades = (zoneId: string) =>
  apiFetch<ApiBrigade[]>(`/sectors/${encodeURIComponent(zoneId)}/brigades`)

export const fetchSectorSupplies = (zoneId: string) =>
  apiFetch<ApiSupply[]>(`/sectors/${encodeURIComponent(zoneId)}/supplies`)

export const fetchSectorDeadlines = (zoneId: string) =>
  apiFetch<ApiDeadline[]>(`/sectors/${encodeURIComponent(zoneId)}/deadlines`)
