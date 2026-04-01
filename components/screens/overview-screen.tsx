"use client"

import { GitBranch, AlertTriangle, Wrench, Rocket, GitPullRequest, TrendingUp, Clock, Zap, Brain, Scale } from "lucide-react"
import { REPOS, ISSUES, DEPLOYMENTS, PULL_REQUESTS, ACTIVITY } from "@/lib/seed-data"
import { cn } from "@/lib/utils"
import type { Screen } from "@/lib/seed-data"

const SEVERITY_COLOR: Record<string, string> = {
  critical: "text-red-400 bg-red-400/10 border-red-400/20",
  high: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  low: "text-blue-400 bg-blue-400/10 border-blue-400/20",
}

const STATUS_COLOR: Record<string, string> = {
  success: "text-green-400",
  error: "text-red-400",
  running: "text-blue-400",
  pending: "text-yellow-400",
}

const MODEL_ICON: Record<string, React.ElementType> = {
  fast: Zap,
  balanced: Scale,
  deep: Brain,
}

interface OverviewScreenProps {
  onNavigate: (screen: Screen, context?: Record<string, string>) => void
}

export function OverviewScreen({ onNavigate }: OverviewScreenProps) {
  const criticalCount = ISSUES.filter((i) => i.severity === "critical").length
  const highCount = ISSUES.filter((i) => i.severity === "high").length
  const activeDeployments = DEPLOYMENTS.filter((d) => d.status === "running").length
  const pendingPRs = PULL_REQUESTS.length

  const stats = [
    {
      label: "Connected Repos",
      value: REPOS.length,
      icon: GitBranch,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      onClick: () => onNavigate("repositories"),
    },
    {
      label: "Open Issues",
      value: ISSUES.length,
      sub: `${criticalCount} critical`,
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-400/10",
      onClick: () => onNavigate("analysis"),
    },
    {
      label: "Pending Fixes",
      value: 2,
      icon: Wrench,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      onClick: () => onNavigate("fixes"),
    },
    {
      label: "Active Deployments",
      value: activeDeployments,
      icon: Rocket,
      color: "text-green-400",
      bg: "bg-green-400/10",
      onClick: () => onNavigate("deployments"),
    },
    {
      label: "PRs Awaiting Review",
      value: pendingPRs,
      icon: GitPullRequest,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      onClick: () => onNavigate("pull-requests"),
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">AI workspace status across all connected repositories</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <button
              key={s.label}
              onClick={s.onClick}
              className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-card hover:border-indigo-500/30 hover:bg-card/80 transition-colors text-left"
            >
              <div className={cn("w-8 h-8 rounded-md flex items-center justify-center", s.bg)}>
                <Icon className={cn("w-4 h-4", s.color)} />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                {s.sub && <div className={cn("text-xs mt-0.5 font-medium", s.color)}>{s.sub}</div>}
              </div>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity timeline */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Recent AI Activity</h2>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-3">
            {ACTIVITY.map((a) => {
              const ModelIcon = a.model ? MODEL_ICON[a.model] : null
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0", STATUS_COLOR[a.status])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground truncate">{a.title}</span>
                      {ModelIcon && <ModelIcon className="w-3 h-3 text-muted-foreground shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{a.description}</p>
                    {a.repoName && (
                      <span className="text-[10px] text-muted-foreground/60 font-mono">{a.repoName}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{a.timestamp}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Repo health */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Repository Health</h2>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-3">
            {REPOS.map((r) => (
              <button
                key={r.id}
                onClick={() => onNavigate("analysis", { repoId: r.id })}
                className="flex items-center gap-3 p-3 rounded-md bg-secondary/50 hover:bg-secondary transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground font-mono">{r.name}</span>
                    <span className="text-[10px] text-muted-foreground">{r.language}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", r.healthScore >= 80 ? "bg-green-400" : r.healthScore >= 60 ? "bg-yellow-400" : "bg-red-400")}
                        style={{ width: `${r.healthScore}%` }}
                      />
                    </div>
                    <span className={cn("text-[10px] font-medium shrink-0", r.healthScore >= 80 ? "text-green-400" : r.healthScore >= 60 ? "text-yellow-400" : "text-red-400")}>
                      {r.healthScore}%
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-medium text-muted-foreground">{r.openIssues} issues</div>
                  <div className="text-[10px] text-muted-foreground/60 mt-0.5">{r.lastCommit}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
