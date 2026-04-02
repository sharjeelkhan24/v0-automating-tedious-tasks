"use client"

import { useState } from "react"
import {
  Activity, BarChart2, Wrench, GitPullRequest, Rocket, Link2,
  Zap, Scale, Brain, CheckCircle2, XCircle, Loader2, Clock,
  ChevronRight, Filter,
} from "lucide-react"
import { ACTIVITY, REPOS, MODELS } from "@/lib/seed-data"
import { cn } from "@/lib/utils"
import type { ActivityItem, ModelTier } from "@/lib/seed-data"

const TYPE_CONFIG: Record<ActivityItem["type"], { label: string; icon: React.ElementType; color: string; bg: string }> = {
  analysis: { label: "Analysis",   icon: BarChart2,     color: "text-yellow-400",  bg: "bg-yellow-400/10" },
  fix:      { label: "Fix",        icon: Wrench,        color: "text-orange-400",  bg: "bg-orange-400/10" },
  pr:       { label: "PR",         icon: GitPullRequest, color: "text-indigo-400", bg: "bg-indigo-400/10" },
  deploy:   { label: "Deploy",     icon: Rocket,        color: "text-emerald-400", bg: "bg-emerald-400/10" },
  connect:  { label: "Connect",    icon: Link2,         color: "text-blue-400",    bg: "bg-blue-400/10" },
}

const STATUS_CONFIG: Record<ActivityItem["status"], { label: string; color: string; icon: React.ElementType }> = {
  success: { label: "Success", color: "text-green-400",  icon: CheckCircle2 },
  error:   { label: "Failed",  color: "text-red-400",    icon: XCircle },
  running: { label: "Running", color: "text-blue-400",   icon: Loader2 },
  pending: { label: "Pending", color: "text-yellow-400", icon: Clock },
}

const MODEL_ICON: Record<ModelTier, React.ElementType> = { fast: Zap, balanced: Scale, deep: Brain }
const MODEL_COLOR: Record<ModelTier, string> = { fast: "text-green-400", balanced: "text-blue-400", deep: "text-purple-400" }

// Extended audit rows for the activity page
const AUDIT_LOG: Array<ActivityItem & {
  trigger: string
  evidence: string
  output: string
  approvalState: "auto" | "approved" | "pending" | "rejected"
}> = [
  {
    id: "a1",
    type: "analysis",
    title: "Deep analysis completed",
    description: "Found 7 issues across api-gateway — 2 critical, 3 high",
    timestamp: "8m ago",
    status: "success",
    repoName: "acme/api-gateway",
    model: "deep",
    trigger: "Manual — triggered by engineer@acme.com",
    evidence: "Inspected 48 source files. Found 14 function-level security patterns. Matched 2 OWASP categories.",
    output: "6 issues filed across security, performance, and code-quality categories",
    approvalState: "auto",
  },
  {
    id: "a2",
    type: "fix",
    title: "Patch generated: SQL injection fix",
    description: "SQL injection fix ready for review — confidence 97%",
    timestamp: "10m ago",
    status: "success",
    repoName: "acme/api-gateway",
    model: "deep",
    trigger: "Auto — triggered after analysis completed (issue i1)",
    evidence: "Reviewed src/routes/users.ts lines 44-51. Identified unparameterized query. Cross-referenced pg library docs.",
    output: "2-line patch replacing string interpolation with parameterized placeholder",
    approvalState: "pending",
  },
  {
    id: "a3",
    type: "pr",
    title: "Pull request opened",
    description: "mase/fix-sql-injection-i1 → main — all checks passing",
    timestamp: "10m ago",
    status: "success",
    repoName: "acme/api-gateway",
    trigger: "Manual — approved by engineer@acme.com",
    evidence: "Patch approved in fix review. Branch created from main HEAD a3f9c21.",
    output: "PR #142 opened — title: 'fix: parameterize SQL queries (MASE-i1)'",
    approvalState: "approved",
  },
  {
    id: "a4",
    type: "deploy",
    title: "Deployment succeeded",
    description: "frontend-app deployed to Vercel in 48s",
    timestamp: "12m ago",
    status: "success",
    repoName: "acme/frontend-app",
    trigger: "Auto — triggered on merge to main",
    evidence: "24 pages built. Bundle size 2.4 MB. No warnings.",
    output: "Live at https://frontend-app-acme.vercel.app",
    approvalState: "auto",
  },
  {
    id: "a5",
    type: "analysis",
    title: "Analysis running",
    description: "Scanning data-pipeline for security and quality issues...",
    timestamp: "15m ago",
    status: "running",
    repoName: "acme/data-pipeline",
    model: "deep",
    trigger: "Manual — triggered by engineer@acme.com",
    evidence: "Scanning 62 Python files. 24% complete.",
    output: "In progress — 3 issues filed so far",
    approvalState: "auto",
  },
  {
    id: "a6",
    type: "deploy",
    title: "Deployment failed",
    description: "data-pipeline build error — torch dependency conflict",
    timestamp: "1h ago",
    status: "error",
    repoName: "acme/data-pipeline",
    trigger: "Auto — triggered on push to main",
    evidence: "pip install failed at torch==2.1.0. Railway builder returned exit 1.",
    output: "Build failed after 67s — no deployment",
    approvalState: "auto",
  },
]

type FilterType = "all" | ActivityItem["type"]
type FilterStatus = "all" | ActivityItem["status"]

export function ActivityScreen() {
  const [typeFilter, setTypeFilter] = useState<FilterType>("all")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = AUDIT_LOG.filter((item) => {
    const typeMatch = typeFilter === "all" || item.type === typeFilter
    const statusMatch = statusFilter === "all" || item.status === statusFilter
    return typeMatch && statusMatch
  })

  const selected = AUDIT_LOG.find((a) => a.id === selectedId)

  const APPROVAL_COLOR: Record<string, string> = {
    auto:     "text-muted-foreground bg-secondary border-border",
    approved: "text-green-400 bg-green-400/10 border-green-400/20",
    pending:  "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    rejected: "text-red-400 bg-red-400/10 border-red-400/20",
  }

  const APPROVAL_LABEL: Record<string, string> = {
    auto: "No approval required", approved: "Approved", pending: "Awaiting approval", rejected: "Rejected",
  }

  return (
    <div className="flex gap-0 h-full overflow-hidden">
      {/* ── Main list ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Activity</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Full audit log of all AI jobs and human approvals</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as FilterType)}
              className="text-xs h-8 px-2 rounded-md border border-border bg-secondary text-foreground focus:outline-none"
            >
              <option value="all">All types</option>
              {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="text-xs h-8 px-2 rounded-md border border-border bg-secondary text-foreground focus:outline-none"
            >
              <option value="all">All statuses</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col divide-y divide-border">
            {filtered.map((item) => {
              const typeCfg = TYPE_CONFIG[item.type]
              const statusCfg = STATUS_CONFIG[item.status]
              const TypeIcon = typeCfg.icon
              const StatusIcon = statusCfg.icon
              const ModelIcon = item.model ? MODEL_ICON[item.model] : null
              const isSelected = selectedId === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(isSelected ? null : item.id)}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3.5 text-left hover:bg-secondary/40 transition-colors",
                    isSelected && "bg-secondary/60"
                  )}
                >
                  <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0", typeCfg.bg)}>
                    <TypeIcon className={cn("w-3.5 h-3.5", typeCfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground truncate">{item.title}</span>
                      {ModelIcon && item.model && (
                        <ModelIcon className={cn("w-3 h-3 shrink-0", MODEL_COLOR[item.model])} />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</p>
                    {item.repoName && (
                      <span className="text-[10px] text-muted-foreground/50 font-mono">{item.repoName}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className={cn("flex items-center gap-1 text-[10px] font-medium", statusCfg.color)}>
                      <StatusIcon className={cn("w-3 h-3", item.status === "running" && "animate-spin")} />
                      <span>{statusCfg.label}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
                  </div>
                  <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform", isSelected && "rotate-90")} />
                </button>
              )
            })}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-center px-6">
                <Activity className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No activity matches the current filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Audit drawer ──────────────────────────────────────────────────── */}
      <div className={cn("w-80 shrink-0 border-l border-border overflow-y-auto transition-all", !selected && "hidden lg:block")}>
        <div className="p-4">
          {!selected ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <Activity className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">Select an event to view audit details</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <div className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md mb-2", TYPE_CONFIG[selected.type].bg, TYPE_CONFIG[selected.type].color)}>
                  {(() => { const I = TYPE_CONFIG[selected.type].icon; return <I className="w-3 h-3" /> })()}
                  {TYPE_CONFIG[selected.type].label}
                </div>
                <h3 className="text-sm font-semibold text-foreground text-balance">{selected.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{selected.timestamp}</p>
              </div>

              {[
                { label: "Trigger", value: selected.trigger },
                { label: "Evidence", value: selected.evidence },
                { label: "Output", value: selected.output },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-xs text-foreground leading-relaxed bg-secondary rounded-md p-2.5">{value}</p>
                </div>
              ))}

              {selected.model && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Model Used</p>
                  <div className="flex items-center gap-2 bg-secondary rounded-md p-2.5">
                    {(() => { const I = MODEL_ICON[selected.model!]; return <I className={cn("w-3.5 h-3.5", MODEL_COLOR[selected.model!])} /> })()}
                    <span className="text-xs text-foreground font-medium">
                      {MODELS.find((m) => m.id === selected.model)?.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {MODELS.find((m) => m.id === selected.model)?.provider}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Approval State</p>
                <div className={cn("flex items-center gap-1.5 text-xs font-medium px-2.5 py-2 rounded-md border", APPROVAL_COLOR[selected.approvalState])}>
                  {APPROVAL_LABEL[selected.approvalState]}
                </div>
              </div>

              {selected.repoName && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Repository</p>
                  <span className="text-xs font-mono bg-secondary px-2.5 py-2 rounded-md block text-muted-foreground">{selected.repoName}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
