"use client"

import { useState, useRef, useEffect } from "react"
import { CodingDashboard } from "@/components/coding-dashboard"
import { DeploymentDashboard } from "@/components/deployment-dashboard"
import { GitHubIntegration } from "@/components/github-integration"

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "overview" | "coding" | "deployment" | "github"

type Template = "none" | "grant" | "insurance" | "data-extraction" | "form-automation"

interface TemplateField {
  key: string
  label: string
  placeholder: string
}

const TEMPLATE_FIELDS: Record<Template, TemplateField[]> = {
  none: [],
  grant: [
    { key: "organization", label: "Organization", placeholder: "Acme Non-Profit Inc." },
    { key: "contact", label: "Contact Name", placeholder: "Jane Smith" },
    { key: "email", label: "Email", placeholder: "jane@acme.org" },
    { key: "project", label: "Project Title", placeholder: "Community Outreach 2025" },
    { key: "budget", label: "Budget ($)", placeholder: "50000" },
  ],
  insurance: [
    { key: "fullName", label: "Full Name", placeholder: "John Doe" },
    { key: "dob", label: "Date of Birth", placeholder: "1985-06-15" },
    { key: "policyType", label: "Policy Type", placeholder: "Health / Dental / Vision" },
    { key: "employerId", label: "Employer ID", placeholder: "EMP-00412" },
  ],
  "data-extraction": [
    { key: "source", label: "Source URL / Path", placeholder: "https://example.com/data" },
    { key: "format", label: "Output Format", placeholder: "CSV / JSON" },
    { key: "fields", label: "Fields to Extract", placeholder: "name, email, phone" },
  ],
  "form-automation": [
    { key: "url", label: "Form URL", placeholder: "https://example.com/form" },
    { key: "instructions", label: "Fill Instructions", placeholder: "Use the values from our CRM profile" },
  ],
}

const TEMPLATE_LABELS: Record<Template, string> = {
  none: "Custom Task (No Template)",
  grant: "Grant Application Form",
  insurance: "Insurance Enrollment",
  "data-extraction": "Data Extraction",
  "form-automation": "Generic Form Automation",
}

const LOG_SEQUENCE = [
  "Connecting to target screen...",
  "Capturing screen state...",
  "Identifying UI elements...",
  "Analysing task instructions...",
  "Locating form fields...",
  "Executing step 1 of 6: focus window",
  "Executing step 2 of 6: read current values",
  "Executing step 3 of 6: fill required fields",
  "Executing step 4 of 6: verify inputs",
  "Executing step 5 of 6: submit form",
  "Executing step 6 of 6: confirm submission",
  "Task completed successfully.",
]

const ACTION_SEQUENCE = [
  "Connecting to target...",
  "Reading screen state...",
  "Identifying elements...",
  "Analysing task...",
  "Locating fields...",
  "Focusing window...",
  "Reading current values...",
  "Filling fields...",
  "Verifying inputs...",
  "Submitting form...",
  "Confirming submission...",
  "Completed",
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${active ? "bg-green-500" : "bg-zinc-600"}`} />
  )
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "green" | "blue" }) {
  const cls = {
    default: "bg-zinc-800 text-zinc-300 border-zinc-700",
    green: "bg-green-950 text-green-400 border-green-800",
    blue: "bg-blue-950 text-blue-400 border-blue-800",
  }[variant]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {children}
    </span>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const [selectedScreen, setSelectedScreen] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<Template>("none")
  const [task, setTask] = useState("")
  const [customFields, setCustomFields] = useState<Record<string, string>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [currentAction, setCurrentAction] = useState("")
  const [availableScreens, setAvailableScreens] = useState<string[]>([])
  const [isLoadingScreens, setIsLoadingScreens] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const fields = TEMPLATE_FIELDS[selectedTemplate]
  const canStart = selectedScreen !== "" && (task.trim() !== "" || selectedTemplate !== "none") && !isRunning

  // Reset done state when inputs change
  useEffect(() => {
    setIsDone(false)
    setLogs([])
    setCurrentAction("")
  }, [selectedScreen, selectedTemplate, task])

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  // Reset custom fields when template changes
  useEffect(() => {
    setCustomFields({})
  }, [selectedTemplate])

  const handleScanScreens = async () => {
    setIsLoadingScreens(true)
    setAvailableScreens([])
    await new Promise((r) => setTimeout(r, 1400))
    setAvailableScreens([
      "Chrome — Grant Portal (Tab 1)",
      "Chrome — Insurance Enrollment (Tab 2)",
      "Microsoft Edge — Company Intranet",
      "Firefox — Data Dashboard",
      "Desktop — Spreadsheet Application",
    ])
    setIsLoadingScreens(false)
  }

  const handleStart = async () => {
    setIsRunning(true)
    setIsDone(false)
    setLogs([])
    setCurrentAction(ACTION_SEQUENCE[0])

    for (let i = 0; i < LOG_SEQUENCE.length; i++) {
      await new Promise((r) => setTimeout(r, 700 + Math.random() * 500))
      setLogs((prev) => [...prev, LOG_SEQUENCE[i]])
      setCurrentAction(ACTION_SEQUENCE[Math.min(i + 1, ACTION_SEQUENCE.length - 1)])
    }

    setIsRunning(false)
    setIsDone(true)
  }

  return (
    <div className="grid grid-cols-2 gap-6 p-6 h-full">
      {/* ── Left: Task Configuration ── */}
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-zinc-100 tracking-wide uppercase">Task Configuration</h2>

          {/* Screen Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-400">Screen / Window / Tab</label>
            <div className="flex gap-2">
              <select
                value={selectedScreen}
                onChange={(e) => setSelectedScreen(e.target.value)}
                className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              >
                <option value="">Choose which screen to automate on...</option>
                {availableScreens.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={handleScanScreens}
                disabled={isLoadingScreens}
                className="rounded-md border border-zinc-700 bg-zinc-800 text-zinc-300 text-xs font-medium px-3 py-2 hover:bg-zinc-700 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {isLoadingScreens ? "Scanning..." : "Scan Screens"}
              </button>
            </div>
          </div>

          {/* Template Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-400">Task Template (Optional)</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as Template)}
              className="rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            >
              {(Object.keys(TEMPLATE_LABELS) as Template[]).map((t) => (
                <option key={t} value={t}>{TEMPLATE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Task Description */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-400">Task Description</label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              rows={3}
              placeholder={
                selectedTemplate === "grant"
                  ? "Fill out the grant application form with our organisation details..."
                  : selectedTemplate === "insurance"
                  ? "Complete the insurance enrollment form for the new employee..."
                  : "Describe what you want the AI assistant to do on the selected screen..."
              }
              className="rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-600 leading-relaxed"
            />
          </div>

          {/* Dynamic Template Fields */}
          {fields.length > 0 && (
            <div className="flex flex-col gap-3">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Template Fields</label>
              <div className="grid grid-cols-2 gap-3">
                {fields.map((f) => (
                  <div key={f.key} className="flex flex-col gap-1">
                    <label className="text-xs text-zinc-500">{f.label}</label>
                    <input
                      type="text"
                      value={customFields[f.key] ?? ""}
                      onChange={(e) => setCustomFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 text-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="mt-1 w-full rounded-md bg-zinc-100 text-zinc-900 text-sm font-semibold py-2.5 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? "Running..." : "Start AI Assistant"}
          </button>
        </div>
      </div>

      {/* ── Right: System Status ── */}
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-5 h-full">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100 tracking-wide uppercase">System Status</h2>
            {isRunning && (
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Running
              </span>
            )}
            {isDone && (
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Completed
              </span>
            )}
          </div>

          {/* Capability indicators */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Screen Reading", active: isRunning || isDone },
              { label: "Mouse Control", active: isRunning || isDone },
              { label: "Text Input", active: isRunning || isDone },
              { label: "Form Detection", active: isRunning || isDone },
            ].map(({ label, active }) => (
              <div key={label} className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-800/50 px-3 py-2">
                <StatusDot active={active} />
                <span className="text-xs text-zinc-400">{label}</span>
              </div>
            ))}
          </div>

          {/* Empty / Running / Done state */}
          {!isRunning && logs.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center">
                  <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-zinc-500">Select a screen / window to get started</p>
              </div>
            </div>
          )}

          {(isRunning || logs.length > 0) && (
            <div className="flex flex-col gap-3 flex-1 min-h-0">
              {/* Current Action */}
              <div className="rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2.5">
                <p className="text-xs text-zinc-500 mb-0.5">Current Action</p>
                <p className="text-sm text-zinc-200 font-medium">{currentAction}</p>
              </div>

              {/* Execution Logs */}
              <div className="flex-1 rounded-md border border-zinc-800 bg-zinc-950 p-3 overflow-y-auto min-h-0 max-h-64">
                <p className="text-xs text-zinc-600 mb-2 uppercase tracking-wide">Execution Log</p>
                <div className="flex flex-col gap-1">
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-zinc-600 text-xs font-mono mt-0.5 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={`text-xs font-mono ${log.includes("completed") || log.includes("success") ? "text-green-400" : "text-zinc-400"}`}>
                        {log}
                      </span>
                    </div>
                  ))}
                  {isRunning && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1 h-1 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1 h-1 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1 h-1 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page Shell ───────────────────────────────────────────────────────────────

export default function Page() {
  const [tab, setTab] = useState<Tab>("overview")

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "coding", label: "Coding" },
    { id: "deployment", label: "Deployment" },
    { id: "github", label: "GitHub" },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">MASE Platform</h1>
            <p className="text-sm text-zinc-500 mt-0.5">AI-powered screen automation and development assistant</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="green">System Online</Badge>
            <Badge variant="default">v2.0.0</Badge>
            <Badge variant="blue">Production Ready</Badge>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex gap-1 mt-4 -mb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${
                tab === t.id
                  ? "border-zinc-100 text-zinc-100 bg-zinc-800"
                  : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Tab Content */}
      <main className="flex-1">
        {tab === "overview" && <OverviewTab />}
        {tab === "coding" && <CodingDashboard />}
        {tab === "deployment" && <DeploymentDashboard />}
        {tab === "github" && <GitHubIntegration />}
      </main>
    </div>
  )
}
