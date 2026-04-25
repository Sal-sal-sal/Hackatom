export type ApiPriority = "high" | "medium" | "low"
export type ApiComplexity = "simple" | "medium" | "hard"
export type ApiStatus = "todo" | "in_progress" | "done"
export type ApiDeadlineType = "supply" | "hr" | "general"
export type ApiCandidateSource = "hh" | "linkedin" | "manual"

export interface ApiSector {
  id: number
  zone_id: string
  title: string
  color: string
  status: string
  progress: number
  description: string
  created_at: string
}

export interface ApiSectorWithCounts extends ApiSector {
  brigades_count: number
  supplies_count: number
  deadlines_count: number
}

export interface ApiBrigade {
  id: number
  name: string
  leader_name: string
  members_count: number
  specialization: string
  current_sector_id: number | null
  current_sector: ApiSector | null
  created_at: string
}

export interface ApiEmployee {
  id: number
  full_name: string
  position: string
  experience_years: number
  skills: string[]
  past_projects: string[]
  source: ApiCandidateSource
  brigade_id: number | null
  created_at: string
}

export interface ApiVacancy {
  id: number
  role: string
  required_skills: string[]
  priority: ApiPriority
  complexity: ApiComplexity
  hire_by_date: string
  status: ApiStatus
  created_at: string
}

export interface ApiCandidateMatch {
  full_name: string
  position: string
  experience_years: number
  skills: string[]
  past_projects: string[]
  source: ApiCandidateSource
  match_score: number
  url: string | null
  employer: string | null
  location: string | null
  salary: string | null
  source_id: string | null
  telegram: string | null
}

export interface ApiSupplier {
  id: number
  name: string
  location: string
  country: string
  nuclear_certified: boolean
  rating: number
  contact_info: string
  created_at: string
}

export interface ApiSupply {
  id: number
  material_name: string
  quantity: number
  unit: string
  supplier_id: number | null
  priority: ApiPriority
  complexity: ApiComplexity
  status: ApiStatus
  deadline: string
  progress: number
  nuclear_grade_required: boolean
  note: string
  sector_id: number | null
  created_at: string
  updated_at: string
}

export interface ApiSupplierMatch {
  id: number
  name: string
  rating: number
  nuclear_certified: boolean
  location: string
  score: number
}

export interface ApiDeadline {
  id: number
  title: string
  description: string
  type: ApiDeadlineType
  priority: ApiPriority
  complexity: ApiComplexity
  status: ApiStatus
  start_date: string | null
  deadline_date: string
  progress: number
  related_id: number | null
  sector_id: number | null
  brigade_id: number | null
  created_at: string
}

export interface ApiKanbanBoard {
  todo: ApiDeadline[]
  in_progress: ApiDeadline[]
  done: ApiDeadline[]
}

export interface ApiKpi {
  total: number
  completed: number
  in_progress: number
  overdue: number
  upcoming_7days: number
}

export interface ApiGanttItem {
  id: number
  name: string
  start_date: string
  end_date: string
  progress: number
  category: "foundation" | "electrical" | "structural" | "safety"
}

export interface ApiGanttResponse {
  chart_start: string
  chart_end: string
  items: ApiGanttItem[]
}

export interface ApiAlert {
  id: number
  title: string
  description: string
  severity: "critical" | "warning"
  timestamp: string
}

export interface ApiActivity {
  id: string
  action: string
  target: string
  user: string
  timestamp: string
}
