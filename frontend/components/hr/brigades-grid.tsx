import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users } from "lucide-react"
import { TaskProgressBar, DeadlineIndicator } from "@/components/progress-indicators"
import { brigades } from "@/lib/mock-data"

export function BrigadesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {brigades.map((brigade) => (
        <Card key={brigade.id} className="border bg-card transition-colors hover:border-primary/50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base font-medium">{brigade.name}</CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{brigade.memberCount}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {brigade.leader.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{brigade.leader.name}</p>
                <p className="text-xs text-muted-foreground">Team lead</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-foreground">{brigade.currentTask}</p>
              <div className="flex items-center gap-3">
                <TaskProgressBar progress={brigade.progress} className="flex-1" />
                <span className="text-xs font-medium text-muted-foreground">
                  {brigade.progress}%
                </span>
              </div>
            </div>

            <DeadlineIndicator deadline={brigade.deadline} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
