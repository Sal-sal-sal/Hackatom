import { apiFetch } from "./client"
import type {
  ApiBrigade, ApiVacancy, ApiCandidateMatch, ApiCandidateSource, ApiEmployee,
} from "./types"

export const fetchBrigades = () => apiFetch<ApiBrigade[]>("/employ/brigades")

export const fetchVacancies = () => apiFetch<ApiVacancy[]>("/employ/vacancies")

export const fetchEmployees = () => apiFetch<ApiEmployee[]>("/employ/employees")

export const searchCandidates = (vacancyId: number, source: ApiCandidateSource) =>
  apiFetch<ApiCandidateMatch[]>(`/employ/vacancies/${vacancyId}/search-candidates`, {
    method: "POST",
    body: JSON.stringify({ source }),
  })

export const shortlistCandidate = (vacancyId: number, employeeId: number) =>
  apiFetch<ApiEmployee>(`/employ/vacancies/${vacancyId}/shortlist/${employeeId}`, {
    method: "POST",
  })
