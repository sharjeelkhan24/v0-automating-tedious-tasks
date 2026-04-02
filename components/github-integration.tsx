"use client"

import { useState } from "react"

type AuthStatus = "disconnected" | "connecting" | "connected"

const REPO_ACTIONS = [
  { label: "Clone Repository", desc: "Clone a repository to your local environment" },
  { label: "Create Branch", desc: "Create a new branch from the current HEAD" },
  { label: "Open Pull Request", desc: "Open a PR from the current branch to main" },
  { label: "View Commits", desc: "Browse the recent commit history" },
]

export function GitHubIntegration() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("disconnected")
  const [repoUrl, setRepoUrl] = useState("")
  const [connectedRepo, setConnectedRepo] = useState("")

  const handleConnect = async () => {
    setAuthStatus("connecting")
    await new Promise((r) => setTimeout(r, 1600))
    setAuthStatus("connected")
    setConnectedRepo(repoUrl || "sharjeelkhan24/mase-platform")
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">GitHub Integration</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Connect and manage your repositories</p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-200">Authentication</h3>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              authStatus === "connected" ? "bg-green-500" :
              authStatus === "connecting" ? "bg-yellow-500 animate-pulse" :
              "bg-zinc-600"
            }`} />
            <span className="text-xs text-zinc-400 capitalize">{authStatus}</span>
          </div>
        </div>

        {authStatus !== "connected" ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Repository URL (optional)</label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-600"
              />
            </div>
            <button
              onClick={handleConnect}
              disabled={authStatus === "connecting"}
              className="self-start rounded-md bg-zinc-100 text-zinc-900 text-sm font-semibold px-4 py-2 hover:bg-white disabled:opacity-50 transition-colors"
            >
              {authStatus === "connecting" ? "Connecting..." : "Connect GitHub"}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-800 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-zinc-200">{connectedRepo}</p>
              <p className="text-xs text-zinc-500 mt-0.5">Connected &middot; Read &amp; write access</p>
            </div>
            <button
              onClick={() => { setAuthStatus("disconnected"); setConnectedRepo("") }}
              className="text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-700 rounded px-2.5 py-1 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-4">
        <h3 className="text-sm font-medium text-zinc-200">Repository Actions</h3>
        {authStatus !== "connected" ? (
          <p className="text-sm text-zinc-600">Connect a repository to enable actions.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {REPO_ACTIONS.map(({ label, desc }) => (
              <div key={label} className="rounded-md border border-zinc-800 bg-zinc-800/50 px-4 py-3 flex flex-col gap-1.5">
                <p className="text-sm font-medium text-zinc-200">{label}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
                <button className="self-start mt-1 text-xs border border-zinc-700 rounded px-2.5 py-1 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors">
                  {label.split(" ")[0]}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="text-sm font-medium text-zinc-200 mb-3">Recent Activity</h3>
        {authStatus !== "connected" ? (
          <p className="text-sm text-zinc-600">No repository connected.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {[
              { msg: "Pushed 3 commits to main", time: "2m ago" },
              { msg: "Opened pull request #42 — fix: form validation", time: "1h ago" },
              { msg: "Merged pull request #41 — feat: screen selector", time: "3h ago" },
            ].map(({ msg, time }) => (
              <div key={msg} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                <p className="text-xs text-zinc-400">{msg}</p>
                <p className="text-xs text-zinc-600 shrink-0 ml-4">{time}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
