"use client"

import { useState } from "react"

const ENVIRONMENTS = [
  { name: "Production", url: "https://app.example.com", status: "healthy", lastDeploy: "2h ago", version: "v2.0.0" },
  { name: "Staging", url: "https://staging.example.com", status: "healthy", lastDeploy: "45m ago", version: "v2.1.0-rc1" },
  { name: "Development", url: "https://dev.example.com", status: "deploying", lastDeploy: "Just now", version: "v2.1.0-dev" },
]

const DEPLOY_LOGS = [
  "[00:00] Build started",
  "[00:02] Installing dependencies...",
  "[00:18] Dependencies installed (312 packages)",
  "[00:19] Running build...",
  "[00:45] Build completed",
  "[00:46] Uploading artifacts...",
  "[01:02] Deployment successful",
]

const STATUS_DOT: Record<string, string> = {
  healthy: "bg-green-500",
  deploying: "bg-yellow-500 animate-pulse",
  failed: "bg-red-500",
}

const STATUS_TEXT: Record<string, string> = {
  healthy: "text-green-400",
  deploying: "text-yellow-400",
  failed: "text-red-400",
}

export function DeploymentDashboard() {
  const [showLogs, setShowLogs] = useState(false)

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Deployments</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Environment status and deployment logs</p>
        </div>
        <button
          onClick={() => setShowLogs((v) => !v)}
          className="text-xs font-medium border border-zinc-700 rounded px-3 py-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          {showLogs ? "Hide Logs" : "View Logs"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {ENVIRONMENTS.map((env) => (
          <div key={env.name} className="rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[env.status]}`} />
              <div>
                <p className="text-sm font-medium text-zinc-200">{env.name}</p>
                <p className="text-xs text-zinc-600 font-mono mt-0.5">{env.url}</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-xs text-zinc-500">Version</p>
                <p className="text-xs font-mono text-zinc-300 mt-0.5">{env.version}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Last deploy</p>
                <p className="text-xs text-zinc-300 mt-0.5">{env.lastDeploy}</p>
              </div>
              <span className={`text-xs font-medium capitalize ${STATUS_TEXT[env.status]}`}>
                {env.status}
              </span>
              <button className="text-xs border border-zinc-700 rounded px-2.5 py-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors">
                Deploy
              </button>
            </div>
          </div>
        ))}
      </div>

      {showLogs && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="text-sm font-medium text-zinc-200 mb-3">Deployment Log — Development</h3>
          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
            {DEPLOY_LOGS.map((line, i) => (
              <p key={i} className="text-xs text-zinc-400 font-mono leading-relaxed">{line}</p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Deployments", value: "148" },
          { label: "Success Rate", value: "96.6%" },
          { label: "Avg Build Time", value: "1m 02s" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-center">
            <p className="text-xl font-semibold text-zinc-100">{value}</p>
            <p className="text-xs text-zinc-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
