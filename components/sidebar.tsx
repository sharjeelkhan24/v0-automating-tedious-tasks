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
    <aside className="flex flex-col w-56 shrink-0 h-screen border-r border-border bg-[#0d0d14]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border shrink-0">
        <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
          <Cpu className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-foreground">MASE Platform</span>
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
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm w-full text-left transition-colors",
                isActive
                  ? "bg-indigo-500/10 text-indigo-400 font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                  isActive ? "bg-indigo-500/20 text-indigo-300" : "bg-secondary text-muted-foreground"
                )}>
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0" />}
            </button>
          )
        })}
      </nav>

      {/* Status footer */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-green-500/5 border border-green-500/10">
          <Activity className="w-3 h-3 text-green-400" />
          <span className="text-xs text-green-400">System online</span>
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        </div>
      </div>
    </aside>
  )
}
