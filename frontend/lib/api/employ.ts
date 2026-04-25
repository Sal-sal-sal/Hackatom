import { apiFetch } from "./client"
import type {
  ApiBrigade, ApiVacancy, ApiCandidateMatch, ApiCandidateSource, ApiEmployee,
} from "./types"

export const fetchBrigades = () => apiFetch<ApiBrigade[]>("/employ/brigades")
export const fetchVacancies = () => apiFetch<ApiVacancy[]>("/employ/vacancies")
export const fetchEmployees = () => apiFetch<ApiEmployee[]>("/employ/employees")

export const createBrigade = (data: {
  name: string; leader_name: string; members_count: number; specialization: string
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

export const shortlistCandidate = (vacancyId: number, employeeId: number) =>
  apiFetch<ApiEmployee>(`/employ/vacancies/${vacancyId}/shortlist/${employeeId}`, {
    method: "POST",
  })
