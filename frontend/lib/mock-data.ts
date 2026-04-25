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

// KPI Data
export const kpiData = {
  totalTasks: { value: 247, trend: 12, trendUp: true },
  completed: { value: 156, percentage: 63 },
  inProgress: { value: 68, percentage: 28 },
  overdue: { value: 23, percentage: 9 },
}

// Supplies data
export const supplies: Supply[] = [
  {
    id: "1",
    material: "Reinforced steel A500C",
    quantity: "450 tons",
    supplier: "КазСтальПром",
    priority: "high",
    complexity: "hard",
    status: "in-progress",
    progress: 65,
    deadline: "2026-05-15",
  },
  {
    id: "2",
    material: "Concrete M400",
    quantity: "2,800 m³",
    supplier: "AlmatyBeton",
    priority: "high",
    complexity: "medium",
    status: "in-progress",
    progress: 42,
    deadline: "2026-05-01",
  },
  {
    id: "3",
    material: "Power cable VVG 4x16",
    quantity: "12,500 m",
    supplier: "КазКабель",
    priority: "medium",
    complexity: "simple",
    status: "completed",
    progress: 100,
    deadline: "2026-04-20",
  },
  {
    id: "4",
    material: "DOKA formwork system",
    quantity: "850 units",
    supplier: null,
    priority: "high",
    complexity: "hard",
    status: "not-started",
    progress: 0,
    deadline: "2026-05-25",
  },
  {
    id: "5",
    material: "Welding electrodes E7018",
    quantity: "2,400 kg",
    supplier: "КазСтальПром",
    priority: "low",
    complexity: "simple",
    status: "completed",
    progress: 100,
    deadline: "2026-04-18",
  },
  {
    id: "6",
    material: "Radiation shielding panels",
    quantity: "320 units",
    supplier: null,
    priority: "high",
    complexity: "hard",
    status: "not-started",
    progress: 0,
    deadline: "2026-06-10",
  },
  {
    id: "7",
    material: "Stainless steel pipes DN200",
    quantity: "1,200 m",
    supplier: "КазСтальПром",
    priority: "medium",
    complexity: "medium",
    status: "in-progress",
    progress: 78,
    deadline: "2026-05-08",
  },
  {
    id: "8",
    material: "Control cables KVVG",
    quantity: "8,000 m",
    supplier: "КазКабель",
    priority: "medium",
    complexity: "simple",
    status: "in-progress",
    progress: 55,
    deadline: "2026-05-12",
  },
]

// Brigades data
export const brigades: Brigade[] = [
  {
    id: "1",
    name: "Brigade A — Foundation",
    leader: { name: "Сейткали Б.", avatar: "СБ" },
    memberCount: 24,
    currentTask: "Reactor building foundation reinforcement",
    progress: 72,
    deadline: "2026-05-20",
  },
  {
    id: "2",
    name: "Brigade B — Electrical",
    leader: { name: "Досмухамедов А.", avatar: "ДА" },
    memberCount: 18,
    currentTask: "Main control room wiring installation",
    progress: 45,
    deadline: "2026-05-28",
  },
  {
    id: "3",
    name: "Brigade C — Welding",
    leader: { name: "Иванов С.", avatar: "ИС" },
    memberCount: 15,
    currentTask: "Primary coolant loop welding",
    progress: 88,
    deadline: "2026-05-05",
  },
  {
    id: "4",
    name: "Brigade D — Safety Systems",
    leader: { name: "Нурланов К.", avatar: "НК" },
    memberCount: 12,
    currentTask: "Emergency cooling system installation",
    progress: 34,
    deadline: "2026-06-15",
  },
  {
    id: "5",
    name: "Brigade E — Structural",
    leader: { name: "Петров Д.", avatar: "ПД" },
    memberCount: 28,
    currentTask: "Containment dome steel frame assembly",
    progress: 56,
    deadline: "2026-05-30",
  },
  {
    id: "6",
    name: "Brigade F — Instrumentation",
    leader: { name: "Касымов Р.", avatar: "КР" },
    memberCount: 10,
    currentTask: "Reactor monitoring sensors installation",
    progress: 22,
    deadline: "2026-06-20",
  },
]

// Vacancies data
export const vacancies: Vacancy[] = [
  {
    id: "1",
    role: "Senior Nuclear Safety Engineer",
    skills: ["IAEA standards", "Risk assessment", "PSA", "Russian language"],
    priority: "high",
    hireBy: "2026-05-10",
  },
  {
    id: "2",
    role: "Lead Welding Inspector (ASME)",
    skills: ["ASME IX", "NDE certification", "QA/QC", "Field inspection"],
    priority: "high",
    hireBy: "2026-05-15",
  },
  {
    id: "3",
    role: "Electrical Systems Technician",
    skills: ["Industrial wiring", "PLC programming", "Safety systems"],
    priority: "medium",
    hireBy: "2026-05-25",
  },
  {
    id: "4",
    role: "Construction Project Coordinator",
    skills: ["Project management", "Scheduling", "Primavera P6", "Russian language"],
    priority: "medium",
    hireBy: "2026-06-01",
  },
  {
    id: "5",
    role: "Radiation Protection Specialist",
    skills: ["Dosimetry", "ALARA principles", "Regulatory compliance"],
    priority: "high",
    hireBy: "2026-05-08",
  },
]

// Candidates data
export const candidates: Candidate[] = [
  {
    id: "1",
    name: "Аманов Ержан",
    position: "Nuclear Safety Engineer",
    avatar: "АЕ",
    matchScore: 92,
    skillsMatched: ["IAEA standards", "Risk assessment", "Russian language"],
    skillsTotal: ["IAEA standards", "Risk assessment", "PSA", "Russian language"],
    pastProjects: [
      { name: "Akkuyu NPP, Turkey", isNuclearRelevant: true },
      { name: "Rooppur NPP, Bangladesh", isNuclearRelevant: true },
    ],
  },
  {
    id: "2",
    name: "Козлов Андрей",
    position: "Senior Welding Inspector",
    avatar: "КА",
    matchScore: 85,
    skillsMatched: ["ASME IX", "NDE certification", "QA/QC"],
    skillsTotal: ["ASME IX", "NDE certification", "QA/QC", "Field inspection"],
    pastProjects: [
      { name: "Kursk NPP-2, Russia", isNuclearRelevant: true },
      { name: "Temirtau Steel Plant", isNuclearRelevant: false },
    ],
  },
  {
    id: "3",
    name: "Бекмуратова Айгуль",
    position: "Project Coordinator",
    avatar: "БА",
    matchScore: 78,
    skillsMatched: ["Project management", "Scheduling", "Russian language"],
    skillsTotal: ["Project management", "Scheduling", "Primavera P6", "Russian language"],
    pastProjects: [
      { name: "Astana LRT Project", isNuclearRelevant: false },
      { name: "Tengiz Oil Expansion", isNuclearRelevant: false },
    ],
  },
  {
    id: "4",
    name: "Сулейменов Дархан",
    position: "Radiation Protection Specialist",
    avatar: "СД",
    matchScore: 95,
    skillsMatched: ["Dosimetry", "ALARA principles", "Regulatory compliance"],
    skillsTotal: ["Dosimetry", "ALARA principles", "Regulatory compliance"],
    pastProjects: [
      { name: "VVER-1200 Certification, Russia", isNuclearRelevant: true },
      { name: "Ulba Metallurgical Plant", isNuclearRelevant: true },
    ],
  },
  {
    id: "5",
    name: "Ким Виктор",
    position: "Electrical Technician",
    avatar: "КВ",
    matchScore: 62,
    skillsMatched: ["Industrial wiring", "PLC programming"],
    skillsTotal: ["Industrial wiring", "PLC programming", "Safety systems"],
    pastProjects: [
      { name: "Almaty Power Station", isNuclearRelevant: false },
    ],
  },
]

// Tasks for Kanban
export const tasks: Task[] = [
  {
    id: "1",
    title: "Order radiation shielding panels",
    priority: "high",
    complexity: "hard",
    deadline: "2026-04-28",
    progress: 0,
    type: "supply",
    status: "not-started",
  },
  {
    id: "2",
    title: "Interview safety engineer candidates",
    priority: "high",
    complexity: "medium",
    deadline: "2026-04-30",
    progress: 0,
    type: "hr",
    status: "not-started",
  },
  {
    id: "3",
    title: "Concrete delivery coordination",
    priority: "high",
    complexity: "medium",
    deadline: "2026-05-01",
    progress: 42,
    type: "supply",
    status: "in-progress",
  },
  {
    id: "4",
    title: "Welding team shift scheduling",
    priority: "medium",
    complexity: "simple",
    deadline: "2026-05-03",
    progress: 65,
    type: "hr",
    status: "in-progress",
  },
  {
    id: "5",
    title: "Steel reinforcement inspection",
    priority: "high",
    complexity: "hard",
    deadline: "2026-05-05",
    progress: 80,
    type: "supply",
    status: "in-progress",
  },
  {
    id: "6",
    title: "Onboard new electrical technicians",
    priority: "medium",
    complexity: "medium",
    deadline: "2026-05-08",
    progress: 30,
    type: "hr",
    status: "in-progress",
  },
  {
    id: "7",
    title: "Cable installation phase 1",
    priority: "medium",
    complexity: "simple",
    deadline: "2026-04-20",
    progress: 100,
    type: "supply",
    status: "completed",
  },
  {
    id: "8",
    title: "Brigade A safety training",
    priority: "high",
    complexity: "medium",
    deadline: "2026-04-18",
    progress: 100,
    type: "hr",
    status: "completed",
  },
  {
    id: "9",
    title: "Welding electrode procurement",
    priority: "low",
    complexity: "simple",
    deadline: "2026-04-22",
    progress: 100,
    type: "supply",
    status: "completed",
  },
]

// Recent activities
export const activities: Activity[] = [
  {
    id: "1",
    action: "Updated progress",
    target: "Reactor foundation reinforcement",
    user: "Сейткали Б.",
    timestamp: "2026-04-25T14:32:00",
  },
  {
    id: "2",
    action: "Assigned supplier",
    target: "Stainless steel pipes DN200",
    user: "Project Manager",
    timestamp: "2026-04-25T13:45:00",
  },
  {
    id: "3",
    action: "Completed task",
    target: "Cable installation phase 1",
    user: "Досмухамедов А.",
    timestamp: "2026-04-25T11:20:00",
  },
  {
    id: "4",
    action: "Added candidate",
    target: "Аманов Ержан to shortlist",
    user: "HR Manager",
    timestamp: "2026-04-25T10:15:00",
  },
  {
    id: "5",
    action: "Created task",
    target: "Order radiation shielding panels",
    user: "Project Manager",
    timestamp: "2026-04-25T09:30:00",
  },
  {
    id: "6",
    action: "Marked overdue",
    target: "DOKA formwork delivery",
    user: "System",
    timestamp: "2026-04-24T18:00:00",
  },
]

// Critical alerts
export const alerts: Alert[] = [
  {
    id: "1",
    title: "DOKA formwork delivery delayed",
    description: "Supplier reports 5-day delay. Impact on foundation schedule.",
    severity: "critical",
    timestamp: "2026-04-25T08:00:00",
  },
  {
    id: "2",
    title: "Concrete M400 shortage risk",
    description: "Current delivery rate below required. 42% complete, deadline May 1.",
    severity: "critical",
    timestamp: "2026-04-25T07:30:00",
  },
  {
    id: "3",
    title: "Safety engineer position unfilled",
    description: "Critical role. Hire by date is May 10, no interviews scheduled.",
    severity: "warning",
    timestamp: "2026-04-24T16:00:00",
  },
  {
    id: "4",
    title: "Radiation shielding no supplier",
    description: "High priority material without assigned supplier. Deadline June 10.",
    severity: "warning",
    timestamp: "2026-04-24T14:00:00",
  },
]

// Gantt chart data (4D scheduling)
export const ganttTasks: GanttTask[] = [
  { id: "1", name: "Foundation reinforcement", startDay: 1, duration: 18, progress: 72, category: "foundation" },
  { id: "2", name: "Concrete pouring phase 2", startDay: 5, duration: 12, progress: 42, category: "foundation" },
  { id: "3", name: "Control room wiring", startDay: 3, duration: 22, progress: 45, category: "electrical" },
  { id: "4", name: "Primary loop welding", startDay: 1, duration: 8, progress: 88, category: "structural" },
  { id: "5", name: "Containment steel frame", startDay: 8, duration: 20, progress: 56, category: "structural" },
  { id: "6", name: "Emergency cooling install", startDay: 15, duration: 25, progress: 34, category: "safety" },
  { id: "7", name: "Reactor sensors setup", startDay: 20, duration: 15, progress: 22, category: "electrical" },
  { id: "8", name: "Shielding panel install", startDay: 25, duration: 10, progress: 0, category: "safety" },
]

// Helper functions
export function getDaysUntilDeadline(deadline: string): number {
  const today = new Date("2026-04-25")
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
    minute: "2-digit" 
  })
}
