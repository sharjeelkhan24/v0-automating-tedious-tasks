"use client"

import { GitBranch, Wrench, Rocket, GitPullRequest, TrendingUp, Clock, Zap, Brain, Scale, Monitor, CheckSquare, Activity, BarChart2 } from "lucide-react"
import { REPOS, ISSUES, DEPLOYMENTS, PULL_REQUESTS, ACTIVITY, FIXES } from "@/lib/seed-data"
import { cn } from "@/lib/utils"
import type { Screen } from "@/lib/seed-data"

const STATUS_DOT: Record<string, string> = {
  success: "bg-green-400",
  error: "bg-red-400",
  running: "bg-blue-400 animate-pulse",
  pending: "bg-yellow-400",
}

const STATUS_TEXT: Record<string, string> = {
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

const MODEL_COLOR: Record<string, string> = {
  fast: "text-green-400",
  balanced: "text-blue-400",
  deep: "text-purple-400",
}

interface OverviewScreenProps {
  onNavigate: (screen: Screen) => void
}

export function OverviewScreen({ onNavigate }: OverviewScreenProps) {
  const criticalCount = ISSUES.filter((i) => i.severity === "critical").length
  const activeDeployments = DEPLOYMENTS.filter((d) => d.status === "running").length

  const stats = [
    { label: "System Status",       value: "Online",               sub: "All services",     icon: Activity,       color: "text-green-400",   bg: "bg-green-400/10",   screen: null },
    { label: "Connected Repos",     value: REPOS.length,           sub: "4 active",          icon: GitBranch,      color: "text-primary",     bg: "bg-primary/10",     screen: "repositories" as Screen },
    { label: "Active Screen Jobs",  value: 0,                      sub: "No jobs running",   icon: Monitor,        color: "text-sky-400",     bg: "bg-sky-400/10",     screen: "screen-agent" as Screen },
    { label: "Analysis Jobs",       value: 1,                      sub: "1 running",         icon: BarChart2,      color: "text-yellow-400",  bg: "bg-yellow-400/10",  screen: "analysis" as Screen },
    { label: "Pending Fixes",       value: FIXES.length,           sub: `${criticalCount} critical`, icon: Wrench, color: "text-orange-400",  bg: "bg-orange-400/10",  screen: "fixes" as Screen },
    { label: "PRs Awaiting Review", value: PULL_REQUESTS.length,   sub: "1 merge ready",     icon: GitPullRequest, color: "text-purple-400",  bg: "bg-purple-400/10",  screen: "pull-requests" as Screen },
    { label: "Active Deployments",  value: activeDeployments,      sub: "1 failed",          icon: Rocket,         color: "text-emerald-400", bg: "bg-emerald-400/10", screen: "deployments" as Screen },
    { label: "Approvals Waiting",   value: 1,                      sub: "Requires action",   icon: CheckSquare,    color: "text-red-400",     bg: "bg-red-400/10",     screen: "fixes" as Screen },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Mission control — AI workspace status across all connected systems</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon
          const el = (
            <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-card text-left w-full h-full transition-all card-ai">
              <div className={cn("w-8 h-8 rounded-md flex items-center justify-center shrink-0", s.bg)}>
                <Icon className={cn("w-4 h-4", s.color)} />
              </div>
              <div>
                <div className={cn("text-2xl font-bold", typeof s.value === "string" ? s.color : "text-foreground")}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                <div className="text-[11px] text-muted-foreground/60 mt-0.5">{s.sub}</div>
              </div>
            </div>
          )
          return s.screen ? (
            <button key={s.label} onClick={() => onNavigate(s.screen!)} className="hover:brightness-105 transition-all rounded-lg">
              {el}
            </button>
          ) : (
            <div key={s.label}>{el}</div>
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
          <div className="flex flex-col divide-y divide-border">
            {ACTIVITY.map((a) => {
              const ModelIcon = a.model ? MODEL_ICON[a.model] : null
              return (
                <div key={a.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", STATUS_DOT[a.status])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-foreground truncate">{a.title}</span>
                      {ModelIcon && a.model && (
                        <ModelIcon className={cn("w-3 h-3 shrink-0", MODEL_COLOR[a.model])} />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{a.description}</p>
                    {a.repoName && (
                      <span className="text-[10px] text-muted-foreground/50 font-mono">{a.repoName}</span>
                    )}
                  </div>
                  <span className={cn("text-[10px] shrink-0 font-medium", STATUS_TEXT[a.status])}>{a.timestamp}</span>
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
          <div className="flex flex-col gap-2">
            {REPOS.map((r) => (
              <button
                key={r.id}
                onClick={() => onNavigate("analysis")}
                className="flex items-center gap-3 p-3 rounded-md bg-secondary/50 hover:bg-secondary transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground font-mono">{r.name}</span>
                    <span className="text-[10px] text-muted-foreground bg-secondary border border-border px-1.5 py-0.5 rounded">{r.language}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", r.healthScore >= 80 ? "bg-green-400" : r.healthScore >= 60 ? "bg-yellow-400" : "bg-red-400")}
                        style={{ width: `${r.healthScore}%` }}
                      />
                    </div>
                    <span className={cn("text-[10px] font-semibold shrink-0 w-8 text-right", r.healthScore >= 80 ? "text-green-400" : r.healthScore >= 60 ? "text-yellow-400" : "text-red-400")}>
                      {r.healthScore}%
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-medium text-foreground">{r.openIssues} issues</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{r.lastCommit}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
