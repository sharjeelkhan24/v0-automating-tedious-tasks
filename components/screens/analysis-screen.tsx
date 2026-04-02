"use client"

import { useState } from "react"
import { AlertTriangle, ShieldAlert, Zap, FileCode, ChevronRight, Loader2, CheckCircle2, Wrench, ArrowRight } from "lucide-react"
import { REPOS, ISSUES } from "@/lib/seed-data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Screen, Severity, ModelTier } from "@/lib/seed-data"

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  critical: { label: "Critical", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", icon: ShieldAlert },
  high: { label: "High", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", icon: AlertTriangle },
  medium: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", icon: Zap },
  low: { label: "Low", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", icon: FileCode },
}

const CATEGORY_LABEL: Record<string, string> = {
  security: "Security",
  performance: "Performance",
  "code-quality": "Code Quality",
  dependency: "Dependency",
  api: "API Surface",
}

interface AnalysisScreenProps {
  selectedRepo?: string
  selectedModel?: ModelTier
  onSelectIssue?: (issueId: string) => void
}

export function AnalysisScreen({ selectedRepo: repoIdProp, selectedModel: _selectedModel, onSelectIssue }: AnalysisScreenProps) {
  const [selectedRepo, setSelectedRepo] = useState(repoIdProp ?? "r1")
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const repo = REPOS.find((r) => r.id === selectedRepo) ?? REPOS[0]
  const issues = ISSUES.filter((i) => i.repoId === selectedRepo)
  const filtered = activeTab === "all" ? issues : issues.filter((i) => i.category === activeTab || i.severity === activeTab)

  const categories = ["all", "security", "performance", "code-quality", "dependency"]

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setTimeout(() => setIsAnalyzing(false), 2800)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Analysis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {issues.length} issues found in <span className="font-mono text-foreground">{repo.fullName}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="text-xs h-8 px-2 rounded-md border border-border bg-secondary text-foreground focus:outline-none focus:border-indigo-500"
          >
            {REPOS.map((r) => (
              <option key={r.id} value={r.id}>{r.fullName}</option>
            ))}
          </select>
          <Button
            size="sm"
            className="h-8 text-xs bg-indigo-500 hover:bg-indigo-600 text-white gap-1.5"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            {isAnalyzing ? "Analyzing..." : "Run Analysis"}
          </Button>
        </div>
      </div>

      {/* Architecture summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Critical", count: issues.filter((i) => i.severity === "critical").length, color: "text-red-400", bg: "bg-red-400/10" },
          { label: "High", count: issues.filter((i) => i.severity === "high").length, color: "text-orange-400", bg: "bg-orange-400/10" },
          { label: "Medium", count: issues.filter((i) => i.severity === "medium").length, color: "text-yellow-400", bg: "bg-yellow-400/10" },
          { label: "Low", count: issues.filter((i) => i.severity === "low").length, color: "text-blue-400", bg: "bg-blue-400/10" },
        ].map((s) => (
          <div key={s.label} className={cn("flex items-center gap-3 p-3 rounded-lg border border-border", s.bg)}>
            <span className={cn("text-2xl font-bold", s.color)}>{s.count}</span>
            <span className="text-xs text-muted-foreground">{s.label} severity</span>
          </div>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 border-b border-border pb-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={cn(
              "px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px",
              activeTab === cat
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {cat === "all" ? "All Issues" : CATEGORY_LABEL[cat]}
            {cat === "all" && <span className="ml-1.5 text-[10px] bg-secondary px-1 rounded">{issues.length}</span>}
          </button>
        ))}
      </div>

      {/* Issue list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
            <p className="text-sm text-foreground font-medium">No issues in this category</p>
            <p className="text-xs text-muted-foreground">Run a new analysis to check for recent problems</p>
          </div>
        )}
        {filtered.map((issue) => {
          const cfg = SEVERITY_CONFIG[issue.severity]
          const Icon = cfg.icon
          const isExpanded = expandedIssue === issue.id
          return (
            <div
              key={issue.id}
              className={cn("rounded-lg border transition-colors", isExpanded ? "border-indigo-500/30 bg-card" : "border-border bg-card hover:border-border/80")}
            >
              <button
                className="flex items-start gap-3 p-4 w-full text-left"
                onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
              >
                <span className={cn("shrink-0 mt-0.5 p-1 rounded", cfg.bg)}>
                  <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{issue.title}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", cfg.bg, cfg.color, cfg.border)}>
                      {cfg.label}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                      {CATEGORY_LABEL[issue.category]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-mono text-muted-foreground">{issue.filePath}</span>
                    {issue.line && <span className="text-xs text-muted-foreground">line {issue.line}</span>}
                    <span className="ml-auto text-xs text-muted-foreground">{issue.confidence}% confidence</span>
                  </div>
                </div>
                <ChevronRight className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform mt-0.5", isExpanded && "rotate-90")} />
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border pt-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Explanation</p>
                    <p className="text-xs text-foreground leading-relaxed">{issue.explanation}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Recommendation</p>
                    <p className="text-xs text-foreground leading-relaxed">{issue.recommendation}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Evidence</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{issue.evidence}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Affected Files</p>
                    <div className="flex flex-wrap gap-1">
                      {issue.affectedFiles.map((f) => (
                        <span key={f} className="text-[11px] font-mono bg-secondary text-muted-foreground px-2 py-0.5 rounded">{f}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="text-xs h-7 bg-indigo-500 hover:bg-indigo-600 text-white gap-1.5"
                      onClick={() => onSelectIssue?.(issue.id)}
                    >
                      <Wrench className="w-3 h-3" />
                      Generate Fix
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
