"use client"

import { Star, GitBranch, AlertTriangle, ExternalLink } from "lucide-react"
import { REPOS, ISSUES, DEPLOYMENTS } from "@/lib/seed-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Screen } from "@/lib/seed-data"

const STATUS_COLOR = {
  healthy: "text-green-400 bg-green-400/10 border-green-400/20",
  warning: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  critical: "text-red-400 bg-red-400/10 border-red-400/20",
}

const LANG_COLOR: Record<string, string> = {
  TypeScript: "text-blue-400 bg-blue-400/10",
  Python: "text-yellow-400 bg-yellow-400/10",
  Go: "text-teal-400 bg-teal-400/10",
}

interface RepositoriesScreenProps {
  selectedRepo?: string
  onNavigate: (screen: Screen) => void
}

export function RepositoriesScreen({ selectedRepo: _selectedRepo, onNavigate }: RepositoriesScreenProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Repositories</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{REPOS.length} repositories connected</p>
        </div>
        <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs h-8">
          Connect Repository
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPOS.map((repo) => {
          const repoIssues = ISSUES.filter((i) => i.repoId === repo.id)
          const criticalIssues = repoIssues.filter((i) => i.severity === "critical")
          const lastDeploy = DEPLOYMENTS.find((d) => d.repoId === repo.id)

          return (
            <div
              key={repo.id}
              className="flex flex-col gap-4 p-4 rounded-lg border border-border bg-card hover:border-indigo-500/20 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground font-mono">{repo.name}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", STATUS_COLOR[repo.status])}>
                      {repo.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{repo.description}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground shrink-0">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", LANG_COLOR[repo.language] ?? "text-muted-foreground bg-secondary")}>
                  {repo.language}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>{repo.stars}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  <span className="font-mono">{repo.branch}</span>
                </div>
                <span className="ml-auto">{repo.lastCommit}</span>
              </div>

              {/* Health bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", repo.healthScore >= 80 ? "bg-green-400" : repo.healthScore >= 60 ? "bg-yellow-400" : "bg-red-400")}
                    style={{ width: `${repo.healthScore}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground w-12 text-right">Health {repo.healthScore}%</span>
              </div>

              {/* Issues summary */}
              <div className="flex items-center gap-2">
                {criticalIssues.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{criticalIssues.length} critical</span>
                  </div>
                )}
                <span className="text-xs text-muted-foreground">{repoIssues.length} total issues</span>
                {lastDeploy && (
                  <span className={cn(
                    "ml-auto text-xs px-2 py-1 rounded",
                    lastDeploy.status === "succeeded" ? "bg-green-400/10 text-green-400" :
                    lastDeploy.status === "running" ? "bg-blue-400/10 text-blue-400" :
                    lastDeploy.status === "failed" ? "bg-red-400/10 text-red-400" :
                    "bg-secondary text-muted-foreground"
                  )}>
                    {lastDeploy.platform} · {lastDeploy.status}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-xs h-7 text-muted-foreground hover:text-foreground"
                  onClick={() => onNavigate("analysis")}
                >
                  Analyze
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-xs h-7 text-muted-foreground hover:text-foreground"
                  onClick={() => onNavigate("deployments")}
                >
                  Deploy
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
