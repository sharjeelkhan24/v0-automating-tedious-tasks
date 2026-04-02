"use client"

import {
  LayoutDashboard, Monitor, GitBranch, ScanSearch, Wrench,
  GitPullRequest, Rocket, Activity, Settings, ChevronRight, Cpu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "@/lib/seed-data"

const NAV_ITEMS: { id: Screen; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: "overview",      label: "Overview",      icon: LayoutDashboard },
  { id: "screen-agent",  label: "Screen Agent",  icon: Monitor },
  { id: "repositories",  label: "Repositories",  icon: GitBranch, badge: 4 },
  { id: "analysis",      label: "Analysis",      icon: ScanSearch, badge: 19 },
  { id: "fixes",         label: "Fixes",         icon: Wrench, badge: 2 },
  { id: "pull-requests", label: "Pull Requests",  icon: GitPullRequest, badge: 2 },
  { id: "deployments",   label: "Deployments",   icon: Rocket },
  { id: "activity",      label: "Activity",      icon: Activity },
  { id: "settings",      label: "Settings",      icon: Settings },
]

interface SidebarProps {
  active: Screen
  onNavigate: (screen: Screen) => void
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="flex flex-col w-56 shrink-0 h-screen border-r border-border bg-[hsl(222,50%,4%)] backdrop-blur">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border shrink-0">
        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-sm">
          <Cpu className="w-4 h-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-tight text-foreground leading-tight">MASE</span>
          <span className="text-[10px] text-muted-foreground tracking-widest uppercase leading-tight">Platform</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm w-full text-left transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary font-medium border border-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded-full tabular-nums",
                  isActive ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                )}>
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="w-3 h-3 text-primary shrink-0" />}
            </button>
          )
        })}
      </nav>

      {/* Status footer */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-green-500/5 border border-green-500/15">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
          <span className="text-xs text-green-400 flex-1">System online</span>
          <span className="text-[10px] text-green-400/50 font-mono">v2.0</span>
        </div>
      </div>
    </aside>
  )
}
