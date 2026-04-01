"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, Clock, GitMerge, GitPullRequest } from "lucide-react"
import { PULL_REQUESTS, REPOS } from "@/lib/seed-data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Screen } from "@/lib/seed-data"

const CHECK_ICON = {
  pass: CheckCircle2,
  fail: XCircle,
  pending: Clock,
}
const CHECK_COLOR = {
  pass: "text-green-400",
  fail: "text-red-400",
  pending: "text-yellow-400",
}

interface PullRequestScreenProps {
  issueId?: string
  onNavigate: (screen: Screen, context?: Record<string, string>) => void
}

export function PullRequestScreen({ onNavigate }: PullRequestScreenProps) {
  const [merged, setMerged] = useState<Record<string, boolean>>({})
  const [declined, setDeclined] = useState<Record<string, boolean>>({})

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Pull Requests</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{PULL_REQUESTS.length} AI-generated pull requests awaiting review</p>
      </div>

      <div className="flex flex-col gap-4">
        {PULL_REQUESTS.map((pr) => {
          const repo = REPOS.find((r) => r.id === pr.repoId)
          const allPassing = pr.checks.every((c) => c.status === "pass")
          const isMerged = merged[pr.id]
          const isDeclined = declined[pr.id]

          return (
            <div key={pr.id} className="rounded-lg border border-border bg-card">
              {/* PR header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5 p-1.5 rounded-md", pr.mergeReady ? "bg-green-400/10" : "bg-yellow-400/10")}>
                    <GitPullRequest className={cn("w-4 h-4", pr.mergeReady ? "text-green-400" : "text-yellow-400")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground">{pr.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                      {repo && <span className="font-mono">{repo.fullName}</span>}
                      <span>·</span>
                      <span className="font-mono text-indigo-400">{pr.branch}</span>
                      <span>→</span>
                      <span className="font-mono">{pr.baseBranch}</span>
                      <span className="ml-auto">{pr.createdAt}</span>
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded border shrink-0",
                    isMerged ? "bg-purple-400/10 text-purple-400 border-purple-400/20" :
                    isDeclined ? "bg-red-400/10 text-red-400 border-red-400/20" :
                    pr.mergeReady ? "bg-green-400/10 text-green-400 border-green-400/20" :
                    "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
                  )}>
                    {isMerged ? "Merged" : isDeclined ? "Closed" : pr.mergeReady ? "Ready to merge" : "Checks pending"}
                  </span>
                </div>
              </div>

              {/* PR body */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Description */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Description</p>
                  <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-secondary rounded-md p-3 font-mono max-h-40 overflow-y-auto">
                    {pr.description}
                  </div>
                </div>

                {/* Checks */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Checks</p>
                  <div className="flex flex-col gap-1.5">
                    {pr.checks.map((check) => {
                      const Icon = CHECK_ICON[check.status]
                      return (
                        <div key={check.name} className="flex items-center gap-2 p-2 rounded bg-secondary">
                          <Icon className={cn("w-3.5 h-3.5 shrink-0", CHECK_COLOR[check.status])} />
                          <span className="text-xs text-foreground">{check.name}</span>
                          <span className={cn("ml-auto text-xs font-medium", CHECK_COLOR[check.status])}>
                            {check.status}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Merge readiness */}
                  <div className={cn(
                    "flex items-center gap-2 p-2.5 rounded-md mt-3 border",
                    allPassing ? "bg-green-400/10 border-green-400/20" : "bg-yellow-400/10 border-yellow-400/20"
                  )}>
                    {allPassing
                      ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                      : <Clock className="w-4 h-4 text-yellow-400" />}
                    <p className={cn("text-xs font-medium", allPassing ? "text-green-400" : "text-yellow-400")}>
                      {allPassing ? "All checks passed — ready to merge" : "Waiting for checks to complete"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {!isMerged && !isDeclined && (
                <div className="flex gap-2 p-4 pt-0">
                  <Button
                    size="sm"
                    className={cn("gap-1.5 text-xs h-8", allPassing ? "bg-green-500 hover:bg-green-600 text-white" : "bg-secondary text-muted-foreground cursor-not-allowed")}
                    disabled={!allPassing}
                    onClick={() => setMerged((p) => ({ ...p, [pr.id]: true }))}
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    Merge Pull Request
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-8 border-border text-muted-foreground"
                    onClick={() => setDeclined((p) => ({ ...p, [pr.id]: true }))}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-8 ml-auto border-border text-muted-foreground"
                    onClick={() => onNavigate("deployments", { repoId: pr.repoId })}
                  >
                    View Deployments
                  </Button>
                </div>
              )}
              {(isMerged || isDeclined) && (
                <div className="px-4 pb-4">
                  <div className={cn("flex items-center gap-2 p-2.5 rounded-md border text-xs font-medium", isMerged ? "bg-purple-400/10 border-purple-400/20 text-purple-400" : "bg-red-400/10 border-red-400/20 text-red-400")}>
                    {isMerged ? <GitMerge className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span className="ml-1">{isMerged ? "Merged successfully — deployment triggered" : "Pull request closed"}</span>
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
