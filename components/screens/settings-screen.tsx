"use client"

import { Github, Brain, Zap, Scale, CheckCircle2, XCircle, AlertTriangle, Settings2, DollarSign, Shield } from "lucide-react"
import { MODELS } from "@/lib/seed-data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MODEL_ICONS = { fast: Zap, balanced: Scale, deep: Brain }

export function SettingsScreen() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure integrations, AI providers, and workspace defaults</p>
      </div>

      {/* GitHub */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
            <Github className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">GitHub Connection</h2>
            <p className="text-xs text-muted-foreground">Repository access and webhook configuration</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-green-400 font-medium">Connected</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "Organization", value: "acme-corp", icon: CheckCircle2, ok: true },
            { label: "Repositories", value: "4 connected", icon: CheckCircle2, ok: true },
            { label: "Webhooks", value: "Active", icon: CheckCircle2, ok: true },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-center gap-2 p-3 rounded-md bg-secondary">
                <Icon className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  <p className="text-xs text-foreground font-medium">{item.value}</p>
                </div>
              </div>
            )
          })}
        </div>
        <Button variant="outline" size="sm" className="mt-3 text-xs border-border h-8">
          Manage Connection
        </Button>
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
        <div className="flex flex-col gap-3">
          {MODELS.map((model) => {
            const Icon = MODEL_ICONS[model.id]
            return (
              <div
                key={model.id}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                  model.recommended
                    ? "border-purple-500/30 bg-purple-500/5"
                    : "border-border bg-secondary/30"
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
                        Recommended for deep code review
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                  {model.id === "deep" && (
                    <p className="text-xs text-purple-300/80 mt-1.5">
                      Claude Opus is used for architecture review, root-cause analysis, and complex refactors. Every result includes evidence, confidence scores, and reasoning traces.
                    </p>
                  )}
                  <div className="flex gap-1.5 mt-2">
                    {model.badges.map((b) => (
                      <span key={b} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded border border-border">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-green-400">Active</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Settings2,
            title: "Model Routing Defaults",
            description: "Configure which model tier handles each task type automatically",
            color: "text-indigo-400",
            bg: "bg-indigo-400/10",
          },
          {
            icon: DollarSign,
            title: "Budget Limits",
            description: "Set monthly spend caps per model and per repository",
            color: "text-green-400",
            bg: "bg-green-400/10",
          },
          {
            icon: Shield,
            title: "Approval Requirements",
            description: "Require human review before patching code, opening PRs, or deploying",
            color: "text-yellow-400",
            bg: "bg-yellow-400/10",
          },
        ].map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
              <div className={cn("w-8 h-8 rounded-md flex items-center justify-center", card.bg)}>
                <Icon className={cn("w-4 h-4", card.color)} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">{card.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.description}</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs border-border h-7 mt-auto">
                Configure
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
