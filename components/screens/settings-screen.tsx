"use client"

import { useState, useEffect } from "react"
import { Github, Brain, Zap, Scale, Settings2, DollarSign, Shield, Users, BookOpen, ToggleRight } from "lucide-react"
import { MODELS } from "@/lib/seed-data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MODEL_ICONS: Record<string, React.ElementType> = { fast: Zap, balanced: Scale, deep: Brain }

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn("relative w-9 h-5 rounded-full border transition-colors shrink-0",
        checked ? "bg-primary border-primary" : "bg-border border-border"
      )}
    >
      <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
        checked ? "translate-x-4" : "translate-x-0.5"
      )} />
    </button>
  )
}

export function SettingsScreen() {
  const [approvals, setApprovals] = useState({
    patch: true, pr: true, deploy: true, screen: true,
  })
  const [auditLog, setAuditLog] = useState(true)
  const [rbacEnabled, setRbacEnabled] = useState(true)
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [githubToken, setGithubToken] = useState("")
  const [tokenSaved, setTokenSaved] = useState(false)

  useEffect(() => {
    const savedToken = localStorage.getItem("github_token")
    if (savedToken) {
      setTokenSaved(true)
    }
  }, [])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure integrations, AI providers, and workspace controls</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* GitHub Connection */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
              <Github className="w-4 h-4 text-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-foreground">GitHub Connection</h2>
              <p className="text-xs text-muted-foreground">Repository access via Personal Access Token</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", tokenSaved ? "bg-green-400" : "bg-muted-foreground/30")} />
              <span className={cn("text-xs font-medium", tokenSaved ? "text-green-400" : "text-muted-foreground")}>
                {tokenSaved ? "Connected" : "Not connected"}
              </span>
            </div>
          </div>

          {!showTokenInput ? (
            <div className="space-y-3">
              <div className="rounded-md bg-secondary/50 border border-border p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Required Permissions</p>
                <div className="flex flex-wrap gap-1.5">
                  {["repo", "workflow", "read:org", "admin:repo_hook"].map((p) => (
                    <span key={p} className="text-[10px] font-mono bg-secondary border border-border text-muted-foreground px-1.5 py-0.5 rounded">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs border-border h-7"
                  onClick={() => setShowTokenInput(true)}
                >
                  {tokenSaved ? "Update Token" : "Add GitHub Token"}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => window.open("https://github.com/settings/tokens/new?scopes=repo,workflow,read:org,admin:repo_hook", "_blank")}
                >
                  Generate Token →
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  GitHub Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full rounded-md border border-border bg-background text-foreground text-sm px-3 py-2 font-mono focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                />
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Token is stored locally and used for GitHub API operations
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="text-xs h-7 bg-primary hover:bg-primary/90"
                  onClick={() => {
                    if (githubToken.trim()) {
                      localStorage.setItem("github_token", githubToken)
                      setTokenSaved(true)
                      setShowTokenInput(false)
                      setGithubToken("")
                    }
                  }}
                  disabled={!githubToken.trim()}
                >
                  Save Token
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs border-border h-7"
                  onClick={() => {
                    setShowTokenInput(false)
                    setGithubToken("")
                  }}
                >
                  Cancel
                </Button>
                {tokenSaved && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-7 text-red-400 hover:text-red-300"
                    onClick={() => {
                      localStorage.removeItem("github_token")
                      setTokenSaved(false)
                      setShowTokenInput(false)
                      setGithubToken("")
                    }}
                  >
                    Remove Token
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Authentication & Access */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-md bg-indigo-400/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Authentication &amp; Access</h2>
              <p className="text-xs text-muted-foreground">Roles, RBAC, and protected actions</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-md bg-secondary mb-3">
            <div>
              <p className="text-xs font-medium text-foreground">Role-Based Access Control</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Restrict actions by user role</p>
            </div>
            <Toggle checked={rbacEnabled} onChange={setRbacEnabled} />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Protected Actions</p>
          <div className="flex flex-col gap-1.5">
            {[
              { action: "Approve fix patches", role: "Admin / Senior Engineer" },
              { action: "Open pull requests", role: "Engineer+" },
              { action: "Trigger deployments", role: "Admin" },
              { action: "Modify model routing", role: "Admin" },
            ].map(({ action, role }) => (
              <div key={action} className="flex items-center justify-between px-2.5 py-2 rounded bg-secondary/50 border border-border">
                <span className="text-xs text-foreground">{action}</span>
                <span className="text-[10px] text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-1.5 py-0.5 rounded font-medium">{role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Providers */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">AI Provider Configuration</h2>
            <p className="text-xs text-muted-foreground">Multi-model routing across providers</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {MODELS.map((model) => {
            const Icon = MODEL_ICONS[model.id]
            return (
              <div
                key={model.id}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                  model.recommended ? "border-purple-500/30 bg-purple-500/5" : "border-border bg-secondary/30"
                )}
              >
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", model.bg)}>
                  <Icon className={cn("w-4 h-4", model.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{model.label}</span>
                    <span className="text-xs text-muted-foreground">{model.provider}</span>
                    {model.recommended && (
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full font-medium">
                        Deep reasoning
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                  <div className="flex gap-1.5 mt-2">
                    {model.badges.map((b) => (
                      <span key={b} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded border border-border">{b}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-green-400">Active</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Model Routing */}
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
          <div className="w-8 h-8 rounded-md bg-indigo-400/10 flex items-center justify-center">
            <Settings2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Model Routing Defaults</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Configure which model tier handles each task type automatically</p>
          </div>
          <div className="flex flex-col gap-1.5 mt-auto">
            {[
              { task: "Quick analysis", model: "Fast" },
              { task: "Fix drafting", model: "Balanced" },
              { task: "Architecture review", model: "Deep" },
            ].map(({ task, model }) => (
              <div key={task} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded bg-secondary">
                <span className="text-muted-foreground">{task}</span>
                <span className="text-foreground font-medium">{model}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="text-xs border-border h-7">Configure</Button>
        </div>

        {/* Budget Controls */}
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
          <div className="w-8 h-8 rounded-md bg-green-400/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Budget Controls</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Set monthly spend caps per model and per repository</p>
          </div>
          <div className="flex flex-col gap-1.5 mt-auto">
            {[
              { label: "Monthly cap", value: "$200.00" },
              { label: "This month", value: "$48.22" },
              { label: "Remaining", value: "$151.78" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded bg-secondary">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground font-medium font-mono">{value}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="text-xs border-border h-7">Configure</Button>
        </div>

        {/* Safety & Approvals */}
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
          <div className="w-8 h-8 rounded-md bg-yellow-400/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Safety &amp; Approvals</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Human review gates before critical actions</p>
          </div>
          <div className="flex flex-col gap-2 mt-auto">
            {[
              { label: "Approval before patch", key: "patch" as const },
              { label: "Approval before PR", key: "pr" as const },
              { label: "Approval before deploy", key: "deploy" as const },
              { label: "Approval before screen action", key: "screen" as const },
            ].map(({ label, key }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <Toggle checked={approvals[key]} onChange={(v) => setApprovals((p) => ({ ...p, [key]: v }))} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Logging */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">Audit Logging</h2>
            <p className="text-xs text-muted-foreground">Persistent, immutable log of all AI actions and approvals</p>
          </div>
          <Toggle checked={auditLog} onChange={setAuditLog} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Events logged", value: "1,847" },
            { label: "Retention period", value: "90 days" },
            { label: "Approval events", value: "312" },
            { label: "Export format", value: "JSON / CSV" },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-md bg-secondary text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="text-xs border-border h-7">Export Audit Log</Button>
          <Button variant="outline" size="sm" className="text-xs border-border h-7 gap-1.5">
            <ToggleRight className="w-3 h-3" />
            Configure Retention
          </Button>
        </div>
      </div>
    </div>
  )
}
