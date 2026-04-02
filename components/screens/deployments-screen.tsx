"use client"

import { useState } from "react"
import { Rocket, CheckCircle2, XCircle, Clock, Loader2, RefreshCw, ExternalLink, Terminal } from "lucide-react"
import { DEPLOYMENTS, REPOS } from "@/lib/seed-data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Status } from "@/lib/seed-data"

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  queued: { label: "Queued", color: "text-muted-foreground", bg: "bg-secondary", border: "border-border", icon: Clock },
  running: { label: "Running", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", icon: Loader2 },
  succeeded: { label: "Succeeded", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", icon: CheckCircle2 },
  failed: { label: "Failed", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", icon: XCircle },
  cancelled: { label: "Cancelled", color: "text-muted-foreground", bg: "bg-secondary", border: "border-border", icon: XCircle },
}

const PLATFORM_COLOR: Record<string, string> = {
  Vercel: "text-white bg-black border-white/10",
  Render: "text-green-400 bg-green-400/10 border-green-400/20",
  Railway: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  "Fly.io": "text-blue-400 bg-blue-400/10 border-blue-400/20",
}

export function DeploymentsScreen() {
  const [selectedDeploy, setSelectedDeploy] = useState<string | null>(DEPLOYMENTS[0].id)
  const [filterRepo, setFilterRepo] = useState("all")

  const filtered = filterRepo === "all" ? DEPLOYMENTS : DEPLOYMENTS.filter((d) => d.repoId === filterRepo)
  const activeDeploy = DEPLOYMENTS.find((d) => d.id === selectedDeploy)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Deployments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{DEPLOYMENTS.length} deployments across {REPOS.length} repositories</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterRepo}
            onChange={(e) => setFilterRepo(e.target.value)}
            className="text-xs h-8 px-2 rounded-md border border-border bg-secondary text-foreground focus:outline-none"
          >
            <option value="all">All repos</option>
            {REPOS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <Button size="sm" className="h-8 text-xs bg-indigo-500 hover:bg-indigo-600 text-white gap-1.5">
            <Rocket className="w-3.5 h-3.5" />
            Deploy Now
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3">
        {(["succeeded", "running", "failed", "queued"] as Status[]).map((s) => {
          const cfg = STATUS_CONFIG[s]
          const Icon = cfg.icon
          const count = DEPLOYMENTS.filter((d) => d.status === s).length
          return (
            <div key={s} className={cn("flex items-center gap-3 p-3 rounded-lg border", cfg.bg, cfg.border)}>
              <Icon className={cn("w-4 h-4", cfg.color, s === "running" && "animate-spin")} />
              <div>
                <div className={cn("text-xl font-bold", cfg.color)}>{count}</div>
                <div className="text-xs text-muted-foreground">{cfg.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Deployment table */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">History</h2>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {filtered.map((d) => {
              const cfg = STATUS_CONFIG[d.status]
              const Icon = cfg.icon
              const repo = REPOS.find((r) => r.id === d.repoId)
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeploy(d.id)}
                  className={cn("flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors", selectedDeploy === d.id && "bg-secondary/50")}
                >
                  <span className={cn("shrink-0 p-1 rounded", cfg.bg)}>
                    <Icon className={cn("w-3.5 h-3.5", cfg.color, d.status === "running" && "animate-spin")} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground font-mono">{repo?.name}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", PLATFORM_COLOR[d.platform])}>
                        {d.platform}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-mono text-muted-foreground">{d.commit}</span>
                      <span className="text-[11px] text-muted-foreground">·</span>
                      <span className="text-[11px] font-mono text-muted-foreground truncate">{d.branch}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={cn("text-xs font-medium", cfg.color)}>{cfg.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {d.duration ? `${d.duration}s` : d.startedAt}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Live logs */}
        {activeDeploy && (
          <div className="rounded-lg border border-border bg-card flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Logs</span>
                <span className={cn("text-xs px-1.5 py-0.5 rounded border", STATUS_CONFIG[activeDeploy.status].bg, STATUS_CONFIG[activeDeploy.status].border, STATUS_CONFIG[activeDeploy.status].color)}>
                  {STATUS_CONFIG[activeDeploy.status].label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {activeDeploy.url && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4 font-mono text-xs bg-black/40 overflow-auto max-h-64">
              {activeDeploy.logs.map((log, i) => (
                <div key={i} className={cn("leading-relaxed", log.includes("ERROR") ? "text-red-400" : log.includes("succeeded") || log.includes("live") ? "text-green-400" : "text-muted-foreground")}>
                  {log}
                </div>
              ))}
              {activeDeploy.status === "running" && (
                <div className="flex items-center gap-2 text-blue-400 mt-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Building...</span>
                </div>
              )}
            </div>
            {activeDeploy.metrics && (
              <div className="flex items-center gap-4 px-4 py-3 border-t border-border">
                <div className="text-xs text-muted-foreground">Build <span className="text-foreground font-medium">{activeDeploy.metrics.buildTime}s</span></div>
                <div className="text-xs text-muted-foreground">Deploy <span className="text-foreground font-medium">{activeDeploy.metrics.deployTime}s</span></div>
                <div className="text-xs text-muted-foreground">Size <span className="text-foreground font-medium">{activeDeploy.metrics.size}</span></div>
                {activeDeploy.url && (
                  <a href={activeDeploy.url} className="ml-auto text-xs text-indigo-400 hover:underline font-mono" target="_blank" rel="noopener noreferrer">
                    {activeDeploy.url}
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
