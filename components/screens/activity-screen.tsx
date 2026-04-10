"use client"

import { useState } from "react"
import {
  Activity, BarChart2, Wrench, GitPullRequest, Rocket, Link2,
  Zap, Scale, Brain, CheckCircle2, XCircle, Loader2, Clock,
  ChevronRight, Filter,
} from "lucide-react"
import { ACTIVITY, MODELS } from "@/lib/seed-data"
import { cn } from "@/lib/utils"
import type { ActivityItem, ModelTier } from "@/lib/seed-data"

const TYPE_CONFIG: Record<ActivityItem["type"], { label: string; icon: React.ElementType; color: string; bg: string }> = {
  analysis: { label: "Analysis",    icon: BarChart2,      color: "text-yellow-400",  bg: "bg-yellow-400/10" },
  fix:      { label: "Fix",         icon: Wrench,         color: "text-orange-400",  bg: "bg-orange-400/10" },
  pr:       { label: "PR",          icon: GitPullRequest, color: "text-purple-400",  bg: "bg-purple-400/10" },
  deploy:   { label: "Deploy",      icon: Rocket,         color: "text-emerald-400", bg: "bg-emerald-400/10" },
  connect:  { label: "Connect",     icon: Link2,          color: "text-primary",     bg: "bg-primary/10" },
}

const STATUS_CONFIG: Record<ActivityItem["status"], { label: string; color: string; icon: React.ElementType }> = {
  success: { label: "Success", color: "text-green-400",  icon: CheckCircle2 },
  error:   { label: "Failed",  color: "text-red-400",    icon: XCircle },
  running: { label: "Running", color: "text-blue-400",   icon: Loader2 },
  pending: { label: "Pending", color: "text-yellow-400", icon: Clock },
}

const MODEL_ICON: Record<ModelTier, React.ElementType> = { fast: Zap, balanced: Scale, deep: Brain }
const MODEL_COLOR: Record<ModelTier, string> = { fast: "text-green-400", balanced: "text-blue-400", deep: "text-purple-400" }

const APPROVAL_COLOR: Record<string, string> = {
  auto:     "text-muted-foreground bg-secondary border-border",
  approved: "text-green-400 bg-green-400/10 border-green-400/20",
  pending:  "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  rejected: "text-red-400 bg-red-400/10 border-red-400/20",
}
const APPROVAL_LABEL: Record<string, string> = {
  auto: "No approval required", approved: "Approved", pending: "Awaiting approval", rejected: "Rejected",
}

const AUDIT_LOG = ACTIVITY.map((item, i) => ({
  ...item,
  trigger: i % 2 === 0 ? "Manual — triggered by engineer@acme.com" : "Auto — triggered by pipeline",
  evidence: `Inspected source files and matched ${i + 2} patterns. Analysis complete.`,
  output: item.status === "error" ? "Build failed — no output" : "Completed successfully",
  approvalState: (["auto", "pending", "approved", "auto", "auto", "auto"] as const)[i] ?? "auto",
}))

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

  return (
    <div className="flex gap-0 h-full overflow-hidden">
      {/* Main list */}
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
              {(Object.entries(TYPE_CONFIG) as [ActivityItem["type"], typeof TYPE_CONFIG[ActivityItem["type"]]][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="text-xs h-8 px-2 rounded-md border border-border bg-secondary text-foreground focus:outline-none"
            >
              <option value="all">All statuses</option>
              {(Object.entries(STATUS_CONFIG) as [ActivityItem["status"], typeof STATUS_CONFIG[ActivityItem["status"]]][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary strip */}
        <div className="flex gap-3 px-6 py-3 border-b border-border shrink-0 overflow-x-auto">
          {[
            { label: "Total",     value: AUDIT_LOG.length,                                        color: "text-foreground" },
            { label: "Success",   value: AUDIT_LOG.filter((a) => a.status === "success").length,  color: "text-green-400" },
            { label: "Running",   value: AUDIT_LOG.filter((a) => a.status === "running").length,  color: "text-blue-400" },
            { label: "Failed",    value: AUDIT_LOG.filter((a) => a.status === "error").length,    color: "text-red-400" },
            { label: "Approvals", value: AUDIT_LOG.filter((a) => a.approvalState === "pending").length, color: "text-yellow-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col gap-0.5 px-3 py-1.5 rounded-md bg-secondary shrink-0 min-w-[60px]">
              <span className={cn("text-base font-bold tabular-nums", color)}>{value}</span>
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center px-6">
              <Activity className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No events match the current filters</p>
            </div>
          ) : (
            filtered.map((item) => {
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
                    "flex items-center gap-3 px-6 py-3.5 w-full text-left hover:bg-secondary/40 transition-colors",
                    isSelected && "bg-secondary/60 border-l-2 border-primary"
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
            })
          )}
        </div>
      </div>

      {/* Audit detail drawer */}
      <div className="w-80 shrink-0 border-l border-border overflow-y-auto bg-card hidden lg:block">
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
                <h3 className="text-sm font-semibold text-foreground">{selected.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{selected.timestamp}</p>
              </div>

              {[
                { label: "Trigger",  value: selected.trigger },
                { label: "Evidence", value: selected.evidence },
                { label: "Output",   value: selected.output },
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
