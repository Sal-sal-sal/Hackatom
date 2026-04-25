import type {
  ApiBrigade, ApiVacancy, ApiCandidateMatch, ApiSupply, ApiDeadline,
  ApiStatus, ApiPriority, ApiComplexity,
} from "./types"
import type {
  Brigade, Vacancy, Candidate, Supply, Task, Priority, Complexity, Status,
} from "@/lib/mock-data"

const PRIORITY: Record<ApiPriority, Priority> = { high: "high", medium: "medium", low: "low" }
const COMPLEXITY: Record<ApiComplexity, Complexity> = { simple: "simple", medium: "medium", hard: "hard" }
const STATUS: Record<ApiStatus, Status> = {
  todo: "not-started",
  in_progress: "in-progress",
  done: "completed",
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?"
}

export function mapBrigade(b: ApiBrigade): Brigade {
  return {
    id: String(b.id),
    name: b.name,
    leader: { name: b.leader_name, avatar: initials(b.leader_name) },
    memberCount: b.members_count,
    currentTask: b.specialization,
    progress: 0,
    deadline: b.created_at.slice(0, 10),
  }
}

export function mapVacancy(v: ApiVacancy): Vacancy {
  return {
    id: String(v.id),
    role: v.role,
    skills: v.required_skills,
    priority: PRIORITY[v.priority],
    hireBy: v.hire_by_date,
  }
}

export function mapCandidate(c: ApiCandidateMatch, requiredSkills: string[]): Candidate {
  const matched = c.skills.filter((s) =>
    requiredSkills.some((r) => r.toLowerCase() === s.toLowerCase()),
  )
  const total = Array.from(new Set([...requiredSkills, ...c.skills]))
  return {
    id: c.source_id ?? `${c.source}-${c.full_name}`,
    name: c.full_name,
    position: c.position,
    avatar: initials(c.full_name),
    matchScore: c.match_score,
    skillsMatched: matched,
    skillsTotal: total,
    pastProjects: c.past_projects.map((name) => ({
      name,
      isNuclearRelevant: /nuclear|nрр|реактор|atom/i.test(name),
    })),
  }
}

export function mapSupply(s: ApiSupply, supplierName: string | null): Supply {
  return {
    id: String(s.id),
    material: s.material_name,
    quantity: `${s.quantity} ${s.unit}`,
    supplier: supplierName,
    priority: PRIORITY[s.priority],
    complexity: COMPLEXITY[s.complexity],
    status: STATUS[s.status],
    progress: s.progress,
    deadline: s.deadline,
  }
}

export function mapDeadlineToTask(d: ApiDeadline): Task {
  return {
    id: String(d.id),
    title: d.title,
    priority: PRIORITY[d.priority],
    complexity: COMPLEXITY[d.complexity],
    deadline: d.deadline_date,
    progress: d.progress,
    type: d.type === "hr" ? "hr" : "supply",
    status: STATUS[d.status],
  }
}
