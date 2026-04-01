"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, GitPullRequest, AlertTriangle, FileCode, ShieldCheck } from "lucide-react"
import { ISSUES, FIXES, REPOS } from "@/lib/seed-data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Screen } from "@/lib/seed-data"

const RISK_COLOR = {
  low: "text-green-400 bg-green-400/10 border-green-400/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  high: "text-red-400 bg-red-400/10 border-red-400/20",
}

interface FixScreenProps {
  issueId?: string
  onNavigate: (screen: Screen, context?: Record<string, string>) => void
}

export function FixScreen({ issueId, onNavigate }: FixScreenProps) {
  const [selectedIssueId, setSelectedIssueId] = useState(issueId ?? FIXES[0].issueId)
  const [approved, setApproved] = useState<Record<string, boolean>>({})
  const [rejected, setRejected] = useState<Record<string, boolean>>({})

  const fixableIssues = ISSUES.filter((i) => FIXES.some((f) => f.issueId === i.id))
  const issue = ISSUES.find((i) => i.id === selectedIssueId) ?? ISSUES[0]
  const fix = FIXES.find((f) => f.issueId === selectedIssueId)
  const repo = issue ? REPOS.find((r) => r.id === issue.repoId) : null

  const isApproved = approved[selectedIssueId]
  const isRejected = rejected[selectedIssueId]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Fix Workflow</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-generated patches ready for review</p>
        </div>
        <div className="flex gap-2">
          {fixableIssues.map((i) => (
            <button
              key={i.id}
              onClick={() => setSelectedIssueId(i.id)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-md border transition-colors",
                selectedIssueId === i.id
                  ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-400"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {i.id.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {issue && fix && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Issue + Plan */}
          <div className="flex flex-col gap-4">
            {/* Issue details */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-foreground">Issue Details</span>
                {repo && <span className="ml-auto text-xs font-mono text-muted-foreground">{repo.fullName}</span>}
              </div>
              <h3 className="text-sm font-medium text-foreground mb-2">{issue.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{issue.explanation}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-secondary text-muted-foreground px-2 py-0.5 rounded">{issue.filePath}{issue.line ? `:${issue.line}` : ""}</span>
                <span className="text-xs text-muted-foreground ml-auto">{issue.confidence}% confidence</span>
              </div>
            </div>

            {/* Fix plan */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-foreground">Fix Plan</span>
                <span className={cn("ml-auto text-xs px-2 py-0.5 rounded border", RISK_COLOR[fix.riskLevel])}>
                  {fix.riskLevel} risk
                </span>
              </div>
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-line">{fix.plan}</div>
            </div>

            {/* Risk notes */}
            <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/5 p-4">
              <p className="text-xs font-medium text-yellow-400 mb-1.5">Risk Notes</p>
              <p className="text-xs text-muted-foreground">{fix.riskNotes}</p>
              <p className="text-xs text-green-400 mt-2 font-medium">Expected: {fix.estimatedImpact}</p>
            </div>

            {/* Affected files */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileCode className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Affected Files</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {fix.affectedFiles.map((f) => (
                  <span key={f} className="text-xs font-mono bg-secondary text-muted-foreground px-2 py-1.5 rounded">{f}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Diff preview */}
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-card flex-1">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-medium text-foreground">Diff Preview</span>
                <span className="text-xs text-muted-foreground font-mono">AI-generated patch</span>
              </div>
              <pre className="p-4 text-xs font-mono overflow-auto leading-relaxed text-foreground">
                {fix.diff.split("\n").map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      "px-2 -mx-2 rounded",
                      line.startsWith("+") && !line.startsWith("+++") ? "bg-green-400/10 text-green-400" :
                      line.startsWith("-") && !line.startsWith("---") ? "bg-red-400/10 text-red-400" :
                      line.startsWith("@@") ? "text-blue-400" :
                      "text-muted-foreground"
                    )}
                  >
                    {line || " "}
                  </div>
                ))}
              </pre>
            </div>

            {/* Approval buttons */}
            {!isApproved && !isRejected ? (
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm gap-2"
                  onClick={() => setApproved((prev) => ({ ...prev, [selectedIssueId]: true }))}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Patch
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-border text-sm gap-2"
                  onClick={() => setRejected((prev) => ({ ...prev, [selectedIssueId]: true }))}
                >
                  <XCircle className="w-4 h-4" />
                  Request Changes
                </Button>
                <Button
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm gap-2"
                  onClick={() => onNavigate("pull-requests", { issueId: selectedIssueId })}
                >
                  <GitPullRequest className="w-4 h-4" />
                  Open PR
                </Button>
              </div>
            ) : isApproved ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-400/10 border border-green-400/20">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <p className="text-sm text-green-400 font-medium">Patch approved — ready to open PR</p>
                <Button size="sm" className="ml-auto bg-indigo-500 hover:bg-indigo-600 text-white text-xs" onClick={() => onNavigate("pull-requests", { issueId: selectedIssueId })}>
                  Open PR
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-400/10 border border-red-400/20">
                <XCircle className="w-4 h-4 text-red-400" />
                <p className="text-sm text-red-400 font-medium">Changes requested — regenerating fix...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
