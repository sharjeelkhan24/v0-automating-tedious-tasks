"use client"

import { useState } from "react"
import { GitBranch, ChevronDown, Zap, Scale, Brain, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { REPOS, MODELS, type ModelTier } from "@/lib/seed-data"
import { cn } from "@/lib/utils"

const MODEL_ICONS: Record<ModelTier, React.ElementType> = {
  fast: Zap,
  balanced: Scale,
  deep: Brain,
}

interface TopBarProps {
  selectedRepo: string
  onRepoChange: (id: string) => void
  selectedBranch: string
  onBranchChange: (branch: string) => void
  selectedModel: ModelTier
  onModelChange: (model: ModelTier) => void
}

export function TopBar({
  selectedRepo, onRepoChange,
  selectedBranch, onBranchChange,
  selectedModel, onModelChange,
}: TopBarProps) {
  const repo = REPOS.find((r) => r.id === selectedRepo) ?? REPOS[0]
  const model = MODELS.find((m) => m.id === selectedModel) ?? MODELS[1]
  const ModelIcon = MODEL_ICONS[selectedModel]

  return (
      <header className="flex items-center gap-2 h-14 px-4 border-b border-border bg-background/80 backdrop-blur shrink-0">
      {/* Repo selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 border-border bg-secondary hover:bg-accent">
            <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium">{repo.fullName}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-card border-border">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Repositories</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          {REPOS.map((r) => (
            <DropdownMenuItem
              key={r.id}
              onClick={() => onRepoChange(r.id)}
              className={cn("text-xs cursor-pointer", r.id === selectedRepo && "text-primary")}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{r.fullName}</span>
                <span className="text-muted-foreground">{r.language}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Branch selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 border-border bg-secondary hover:bg-accent">
            <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{selectedBranch}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44 bg-card border-border">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Branches</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          {["main", "develop", "staging"].map((b) => (
            <DropdownMenuItem
              key={b}
              onClick={() => onBranchChange(b)}
              className={cn("text-xs cursor-pointer font-mono", b === selectedBranch && "text-primary")}
            >
              {b}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Model selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("gap-1.5 text-xs h-8 border-border", model.bg, model.color)}
          >
            <ModelIcon className="w-3.5 h-3.5" />
            <span>{model.label}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 bg-card border-border">
          <DropdownMenuLabel className="text-xs text-muted-foreground">AI Model</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          {MODELS.map((m) => {
            const Icon = MODEL_ICONS[m.id]
            return (
              <DropdownMenuItem
                key={m.id}
                onClick={() => onModelChange(m.id)}
                className="flex flex-col items-start gap-1 py-2.5 cursor-pointer"
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className={cn("w-3.5 h-3.5", m.color)} />
                  <span className={cn("font-medium text-xs", m.id === selectedModel && m.color)}>{m.label}</span>
                  {m.recommended && (
                    <span className="ml-auto text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground pl-5">{m.provider}</p>
                <div className="flex gap-1 pl-5">
                  {m.badges.map((b) => (
                    <span key={b} className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">
                      {b}
                    </span>
                  ))}
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1" />

      {/* Search */}
      <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 border-border bg-secondary text-muted-foreground">
        <Search className="w-3.5 h-3.5" />
        <span>Search...</span>
        <kbd className="ml-2 text-[10px] bg-background px-1 rounded border border-border">⌘K</kbd>
      </Button>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="h-8 w-8 relative text-muted-foreground hover:text-foreground">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
      </Button>
    </header>
  )
}
