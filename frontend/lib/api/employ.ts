import { apiFetch } from "./client"
import type {
  ApiBrigade, ApiVacancy, ApiCandidateMatch, ApiCandidateSource, ApiEmployee,
} from "./types"

export const fetchBrigades = (filters: {
  available?: boolean; sectorId?: number
} = {}) => {
  const params = new URLSearchParams()
  if (filters.available !== undefined) params.set("available", String(filters.available))
  if (filters.sectorId !== undefined) params.set("sector_id", String(filters.sectorId))
  const qs = params.toString()
  return apiFetch<ApiBrigade[]>(`/employ/brigades${qs ? `?${qs}` : ""}`)
}

export const updateBrigade = (brigadeId: number, data: { current_sector_id: number | null }) =>
  apiFetch<ApiBrigade>(`/employ/brigades/${brigadeId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
export const fetchVacancies = () => apiFetch<ApiVacancy[]>("/employ/vacancies")
export const fetchEmployees = () => apiFetch<ApiEmployee[]>("/employ/employees")

export const createBrigade = (data: {
  name: string; leader_name: string; members_count: number; specialization: string
  current_sector_id?: number | null
}) => apiFetch<ApiBrigade>("/employ/brigades", { method: "POST", body: JSON.stringify(data) })

export const createVacancy = (data: {
  role: string; required_skills: string[]; priority: string; complexity: string; hire_by_date: string; status: string
}) => apiFetch<ApiVacancy>("/employ/vacancies", { method: "POST", body: JSON.stringify(data) })

export const createEmployee = (data: {
  full_name: string; position: string; experience_years: number; skills: string[]; source: string
}) => apiFetch<ApiEmployee>("/employ/employees", { method: "POST", body: JSON.stringify(data) })

export const searchCandidates = (vacancyId: number, source: ApiCandidateSource) =>
  apiFetch<ApiCandidateMatch[]>(`/employ/vacancies/${vacancyId}/search-candidates`, {
    method: "POST",
    body: JSON.stringify({ source }),
  })

export async function searchAllCandidates(vacancyId: number): Promise<ApiCandidateMatch[]> {
  const [manual, hh] = await Promise.all([
    searchCandidates(vacancyId, "manual").catch(() => [] as ApiCandidateMatch[]),
    searchCandidates(vacancyId, "hh").catch(() => [] as ApiCandidateMatch[]),
  ])
  const seen = new Set<string>()
  return [...manual, ...hh].filter((c) => {
    const key = c.full_name.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).sort((a, b) => b.match_score - a.match_score)
}

export const assignEmployeeBrigade = (employeeId: number, brigadeId: number | null) =>
  apiFetch<ApiEmployee>(`/employ/employees/${employeeId}`, {
    method: "PATCH",
    body: JSON.stringify({ brigade_id: brigadeId }),
  })

export const shortlistCandidate = (vacancyId: number, employeeId: number) =>
  apiFetch<ApiEmployee>(`/employ/vacancies/${vacancyId}/shortlist/${employeeId}`, {
    method: "POST",
  })
