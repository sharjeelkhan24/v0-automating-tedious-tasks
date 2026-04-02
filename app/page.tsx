"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { OverviewScreen } from "@/components/screens/overview-screen"
import { ScreenAgentScreen } from "@/components/screens/screen-agent-screen"
import { RepositoriesScreen } from "@/components/screens/repositories-screen"
import { AnalysisScreen } from "@/components/screens/analysis-screen"
import { FixScreen } from "@/components/screens/fix-screen"
import { PullRequestScreen } from "@/components/screens/pull-request-screen"
import { DeploymentsScreen } from "@/components/screens/deployments-screen"
import { ActivityScreen } from "@/components/screens/activity-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"
import type { Screen, ModelTier } from "@/lib/seed-data"

export default function Page() {
  const [screen, setScreen] = useState<Screen>("overview")
  const [selectedRepo, setSelectedRepo] = useState("r1")
  const [selectedBranch, setSelectedBranch] = useState("main")
  const [selectedModel, setSelectedModel] = useState<ModelTier>("balanced")
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null)
  const [activePrId, setActivePrId] = useState<string | null>(null)

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar active={screen} onNavigate={setScreen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar
          selectedRepo={selectedRepo}
          onRepoChange={setSelectedRepo}
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
        <main className={screen === "screen-agent" || screen === "activity" ? "flex-1 overflow-hidden" : "flex-1 overflow-y-auto"}>
          {screen === "overview"      && <OverviewScreen onNavigate={setScreen} />}
          {screen === "screen-agent"  && <ScreenAgentScreen />}
          {screen === "repositories"  && <RepositoriesScreen selectedRepo={selectedRepo} onNavigate={setScreen} />}
          {screen === "analysis"      && (
            <AnalysisScreen
              selectedRepo={selectedRepo}
              selectedModel={selectedModel}
              onSelectIssue={(id) => { setActiveIssueId(id); setScreen("fixes") }}
            />
          )}
          {screen === "fixes"         && (
            <FixScreen
              issueId={activeIssueId}
              model={selectedModel}
              onOpenPR={(prId) => { setActivePrId(prId); setScreen("pull-requests") }}
            />
          )}
          {screen === "pull-requests" && <PullRequestScreen prId={activePrId} />}
          {screen === "deployments"   && <DeploymentsScreen />}
          {screen === "activity"      && <ActivityScreen />}
          {screen === "settings"      && <SettingsScreen />}
        </main>
      </div>
    </div>
  )
}
