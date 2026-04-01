"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { OverviewScreen } from "@/components/screens/overview-screen"
import { RepositoriesScreen } from "@/components/screens/repositories-screen"
import { AnalysisScreen } from "@/components/screens/analysis-screen"
import { FixScreen } from "@/components/screens/fix-screen"
import { PullRequestScreen } from "@/components/screens/pull-request-screen"
import { DeploymentsScreen } from "@/components/screens/deployments-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"
import type { Screen, ModelTier } from "@/lib/seed-data"

interface NavContext {
  repoId?: string
  issueId?: string
}

export default function Page() {
  const [screen, setScreen] = useState<Screen>("overview")
  const [navContext, setNavContext] = useState<NavContext>({})
  const [selectedRepo, setSelectedRepo] = useState("r1")
  const [selectedBranch, setSelectedBranch] = useState("main")
  const [selectedModel, setSelectedModel] = useState<ModelTier>("deep")

  const handleNavigate = (target: Screen, ctx?: Record<string, string>) => {
    setScreen(target)
    setNavContext(ctx ?? {})
    if (ctx?.repoId) setSelectedRepo(ctx.repoId)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar active={screen} onNavigate={handleNavigate} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar
          selectedRepo={selectedRepo}
          onRepoChange={setSelectedRepo}
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
        <main className="flex-1 overflow-y-auto">
          {screen === "overview" && <OverviewScreen onNavigate={handleNavigate} />}
          {screen === "repositories" && <RepositoriesScreen onNavigate={handleNavigate} />}
          {screen === "analysis" && <AnalysisScreen repoId={navContext.repoId} onNavigate={handleNavigate} />}
          {screen === "fixes" && <FixScreen issueId={navContext.issueId} onNavigate={handleNavigate} />}
          {screen === "pull-requests" && <PullRequestScreen issueId={navContext.issueId} onNavigate={handleNavigate} />}
          {screen === "deployments" && <DeploymentsScreen repoId={navContext.repoId} onNavigate={handleNavigate} />}
          {screen === "settings" && <SettingsScreen />}
        </main>
      </div>
    </div>
  )
}
