import { AppHeader } from "@/components/app-header"
import { AssignmentBoard } from "@/components/assignments/assignment-board"

export default function AssignmentsPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Assignments" },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Назначения бригад</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Привяжите бригаду к задаче — бригада увидит её в своих делах
          </p>
        </div>
        <AssignmentBoard />
      </main>
    </>
  )
}
