"use client"

import { useState, useRef, useEffect } from "react"
import { Monitor, RefreshCw, Play, Pause, Square, ShieldAlert, AlertOctagon, Eye, MousePointer2, Keyboard, FileSearch, Target, Cpu, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type RunState = "idle" | "running" | "paused" | "done" | "error"
type Template = "none" | "grant" | "insurance" | "data-extraction" | "form-automation" | "portal-login" | "browser-workflow" | "copy-data"

const TEMPLATE_LABELS: Record<Template, string> = {
  none:             "Custom Task",
  grant:            "Grant Application Form",
  insurance:        "Insurance Enrollment",
  "data-extraction":"Data Extraction",
  "form-automation":"Generic Form Automation",
  "browser-workflow":"Browser Workflow",
  "portal-login":   "Portal Login",
  "copy-data":      "Copy Data Between Systems",
}

const TEMPLATE_FIELDS: Record<Template, { key: string; label: string; placeholder: string }[]> = {
  none: [],
  grant: [
    { key: "org", label: "Organisation", placeholder: "Acme Non-Profit Inc." },
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
    { key: "source", label: "Source URL", placeholder: "https://example.com/data" },
    { key: "format", label: "Output Format", placeholder: "CSV / JSON" },
    { key: "fields", label: "Fields to Extract", placeholder: "name, email, phone" },
  ],
  "form-automation": [
    { key: "url", label: "Form URL", placeholder: "https://example.com/form" },
    { key: "instructions", label: "Instructions", placeholder: "Fill with CRM values" },
  ],
  "browser-workflow": [
    { key: "startUrl", label: "Start URL", placeholder: "https://example.com" },
    { key: "steps", label: "Steps (comma-separated)", placeholder: "login, navigate to reports, export CSV" },
  ],
  "portal-login": [
    { key: "url", label: "Portal URL", placeholder: "https://portal.example.com" },
    { key: "username", label: "Username", placeholder: "admin@example.com" },
  ],
  "copy-data": [
    { key: "source", label: "Source System", placeholder: "Salesforce CRM" },
    { key: "target", label: "Target System", placeholder: "HubSpot" },
    { key: "fields", label: "Fields to Copy", placeholder: "name, email, company" },
  ],
}

const EXECUTION_STEPS = [
  { step: "Connecting to target screen...", confidence: null },
  { step: "Capturing screen state...", confidence: null },
  { step: "Running OCR / UI element detection...", confidence: 94 },
  { step: "Analysing task instructions...", confidence: null },
  { step: "Locating target form fields...", confidence: 91 },
  { step: "Preparing action plan (6 steps)...", confidence: null },
  { step: "Step 1/6: Focus target window", confidence: 99 },
  { step: "Step 2/6: Read current field values", confidence: 96 },
  { step: "Step 3/6: Fill required fields", confidence: 93 },
  { step: "Step 4/6: Verify inputs before submit", confidence: 99 },
  { step: "Waiting for approval before submit...", confidence: null },
]

const DETECTED_ELEMENTS = [
  { label: "Input: First Name",     type: "input",    x: "18%", y: "24%", w: "28%", h: "5%" },
  { label: "Input: Last Name",      type: "input",    x: "52%", y: "24%", w: "28%", h: "5%" },
  { label: "Input: Email",          type: "input",    x: "18%", y: "34%", w: "62%", h: "5%" },
  { label: "Dropdown: Policy Type", type: "select",   x: "18%", y: "44%", w: "40%", h: "5%" },
  { label: "Button: Submit",        type: "button",   x: "62%", y: "78%", w: "18%", h: "7%" },
  { label: "Checkbox: Agree",       type: "checkbox", x: "18%", y: "70%", w: "5%",  h: "4%" },
]

const ELEMENT_COLORS: Record<string, string> = {
  input:    "border-blue-400 bg-blue-400/10 text-blue-300",
  select:   "border-purple-400 bg-purple-400/10 text-purple-300",
  button:   "border-green-400 bg-green-400/10 text-green-300",
  checkbox: "border-yellow-400 bg-yellow-400/10 text-yellow-300",
}

const SCREENS_MOCK = [
  "Chrome — Grant Portal (Tab 1)",
  "Chrome — Insurance Enrollment (Tab 2)",
  "Microsoft Edge — Company Intranet",
  "Firefox — Data Dashboard",
  "Desktop — Spreadsheet Application",
]

export function ScreenAgentScreen() {
  const [runState, setRunState] = useState<RunState>("idle")
  const [selectedScreen, setSelectedScreen] = useState("")
  const [template, setTemplate] = useState<Template>("none")
  const [taskText, setTaskText] = useState("")
  const [fields, setFields] = useState<Record<string, string>>({})
  const [availableScreens, setAvailableScreens] = useState<string[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [logs, setLogs] = useState<{ step: string; confidence: number | null; ts: string; status: "done" | "running" | "waiting" }[]>([])
  const [currentStep, setCurrentStep] = useState<string>("")
  const [showElements, setShowElements] = useState(false)
  const [approvalPending, setApprovalPending] = useState(false)
  const [requireApprovalBeforeSubmit, setRequireApprovalBeforeSubmit] = useState(true)
  const [safeMode, setSafeMode] = useState(true)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const canStart = selectedScreen !== "" && (taskText.trim() !== "" || template !== "none") && runState === "idle"
  const templateFields = TEMPLATE_FIELDS[template]

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [logs])
  useEffect(() => { setFields({}) }, [template])

  const handleScan = async () => {
    setIsScanning(true)
    await new Promise((r) => setTimeout(r, 1200))
    setAvailableScreens(SCREENS_MOCK)
    setIsScanning(false)
  }

  const handleStart = async () => {
    setRunState("running")
    setLogs([])
    setApprovalPending(false)
    setShowElements(false)

    for (let i = 0; i < EXECUTION_STEPS.length; i++) {
      if (i === 2) setShowElements(true)
      const { step, confidence } = EXECUTION_STEPS[i]
      setCurrentStep(step)

      // Approval gate
      if (step.includes("approval") && requireApprovalBeforeSubmit) {
        setApprovalPending(true)
        setLogs((p) => [...p, { step, confidence, ts: now(), status: "waiting" }])
        return
      }

      await new Promise((r) => setTimeout(r, 600 + Math.random() * 600))
      setLogs((p) => [...p, { step, confidence, ts: now(), status: "done" }])
    }

    setRunState("done")
    setCurrentStep("Task completed successfully.")
  }

  const handleApprove = async () => {
    setApprovalPending(false)
    setLogs((p) => p.map((l) => l.status === "waiting" ? { ...l, status: "done" } : l))

    const remaining = [
      { step: "Step 5/6: Submit form", confidence: 99 },
      { step: "Step 6/6: Confirm submission", confidence: 100 },
      { step: "Task completed successfully.", confidence: null },
    ]

    for (const { step, confidence } of remaining) {
      setCurrentStep(step)
      await new Promise((r) => setTimeout(r, 700))
      setLogs((p) => [...p, { step, confidence, ts: now(), status: "done" }])
    }

    setRunState("done")
  }

  const handleStop = () => { setRunState("idle"); setApprovalPending(false); setCurrentStep("") }
  const handlePause = () => setRunState(runState === "paused" ? "running" : "paused")
  const now = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })

  const statusIndicators = [
    { label: "Screen Reading",    icon: Eye,          active: runState === "running" || runState === "done" },
    { label: "OCR / UI Detect",   icon: FileSearch,   active: showElements },
    { label: "Mouse Control",     icon: MousePointer2, active: runState === "running" },
    { label: "Keyboard Input",    icon: Keyboard,     active: runState === "running" && logs.length > 6 },
    { label: "Form Detection",    icon: Target,       active: showElements },
    { label: "Automation State",  icon: Cpu,          active: runState === "running" || runState === "paused" },
  ]

  return (
    <div className="flex gap-0 h-full overflow-hidden">
      {/* ── Left: Task Configuration ─────────────────────────────────────── */}
      <div className="w-72 shrink-0 border-r border-border overflow-y-auto">
        <div className="p-4 flex flex-col gap-5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Task Configuration</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Set up a screen automation task</p>
          </div>

          {/* Screen selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Screen / Window / Tab</label>
            <div className="flex gap-1.5">
              <select
                value={selectedScreen}
                onChange={(e) => setSelectedScreen(e.target.value)}
                className="flex-1 min-w-0 rounded-md border border-border bg-secondary text-foreground text-xs px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select screen...</option>
                {availableScreens.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="shrink-0 rounded-md border border-border bg-secondary text-muted-foreground text-xs px-2.5 py-2 hover:bg-accent hover:text-foreground disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <RefreshCw className={cn("w-3 h-3", isScanning && "animate-spin")} />
                {isScanning ? "..." : "Scan"}
              </button>
            </div>
          </div>

          {/* Template */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Task Template</label>
            <div className="relative">
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as Template)}
                className="w-full rounded-md border border-border bg-secondary text-foreground text-xs px-2.5 py-2 appearance-none focus:outline-none focus:ring-1 focus:ring-ring pr-7"
              >
                {(Object.keys(TEMPLATE_LABELS) as Template[]).map((t) => (
                  <option key={t} value={t}>{TEMPLATE_LABELS[t]}</option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Task description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Task Description</label>
            <textarea
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              rows={3}
              placeholder="Describe what to do on the selected screen..."
              className="rounded-md border border-border bg-secondary text-foreground text-xs px-2.5 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50 leading-relaxed"
            />
          </div>

          {/* Template fields */}
          {templateFields.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Template Fields</label>
              {templateFields.map((f) => (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-[11px] text-muted-foreground">{f.label}</label>
                  <input
                    type="text"
                    value={fields[f.key] ?? ""}
                    onChange={(e) => setFields((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="rounded-md border border-border bg-secondary text-foreground text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={handleStart}
              disabled={!canStart}
              className="w-full rounded-md bg-primary text-primary-foreground text-xs font-semibold py-2.5 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              Start AI Assistant
            </button>
            {(runState === "running" || runState === "paused") && (
              <div className="flex gap-2">
                <button
                  onClick={handlePause}
                  className="flex-1 rounded-md border border-border bg-secondary text-muted-foreground text-xs font-medium py-2 hover:bg-accent hover:text-foreground transition-colors flex items-center justify-center gap-1"
                >
                  <Pause className="w-3 h-3" />
                  {runState === "paused" ? "Resume" : "Pause"}
                </button>
                <button
                  onClick={handleStop}
                  className="flex-1 rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-xs font-medium py-2 hover:bg-destructive/20 transition-colors flex items-center justify-center gap-1"
                >
                  <Square className="w-3 h-3" />
                  Stop
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Center: Screen Preview ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col border-r border-border min-w-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">
              {selectedScreen || "No screen selected"}
            </span>
          </div>
          {showElements && (
            <span className="text-[10px] bg-blue-400/10 text-blue-400 border border-blue-400/20 px-2 py-0.5 rounded-full font-medium">
              {DETECTED_ELEMENTS.length} elements detected
            </span>
          )}
        </div>

        <div className="flex-1 relative overflow-hidden bg-[#0a0a10]">
          {!selectedScreen ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-8">
              <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
                <Monitor className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Scan and select a screen to begin</p>
              <button onClick={handleScan} disabled={isScanning} className="text-xs border border-border rounded-md px-3 py-1.5 text-muted-foreground hover:bg-secondary transition-colors">
                {isScanning ? "Scanning..." : "Scan Available Screens"}
              </button>
            </div>
          ) : (
            <>
              {/* Mock screen content */}
              <div className="absolute inset-4 rounded-lg border border-border bg-card overflow-hidden">
                <div className="bg-secondary/60 border-b border-border px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400/60" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400/60" />
                    <span className="w-3 h-3 rounded-full bg-green-400/60" />
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-1 text-center font-mono">
                    {selectedScreen.includes("http") ? selectedScreen : "— " + selectedScreen + " —"}
                  </span>
                </div>
                <div className="p-6 flex flex-col gap-4 relative">
                  <h3 className="text-sm font-semibold text-foreground">
                    {TEMPLATE_LABELS[template] === "Custom Task" ? "Target Application" : TEMPLATE_LABELS[template]}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="h-2 w-16 rounded bg-border/60" />
                        <div className="h-8 rounded border border-border bg-secondary/30" />
                      </div>
                    ))}
                  </div>
                  <div className="h-8 rounded border border-border bg-secondary/30" />
                  <div className="flex justify-end gap-2 mt-2">
                    <div className="h-8 w-20 rounded border border-border bg-secondary/30" />
                    <div className="h-8 w-20 rounded bg-primary/30 border border-primary/30" />
                  </div>

                  {/* Detected element overlays */}
                  {showElements && DETECTED_ELEMENTS.map((el) => (
                    <div
                      key={el.label}
                      className={cn("absolute border rounded pointer-events-none", ELEMENT_COLORS[el.type])}
                      style={{ left: el.x, top: el.y, width: el.w, height: el.h }}
                    >
                      <span className="absolute -top-4 left-0 text-[9px] font-mono whitespace-nowrap px-1 py-0.5 rounded bg-background/80">
                        {el.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {runState === "running" && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/90 border border-border rounded-full px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                  {currentStep}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Right: Status + Execution + Safety ───────────────────────────── */}
      <div className="w-72 shrink-0 overflow-y-auto">
        <div className="p-4 flex flex-col gap-5">
          {/* System Status */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">System Status</h3>
            <div className="flex flex-col gap-1.5">
              {statusIndicators.map(({ label, icon: Icon, active }) => (
                <div key={label} className={cn("flex items-center gap-2 px-3 py-2 rounded-md border transition-colors",
                  active ? "border-green-500/20 bg-green-500/5" : "border-border bg-secondary/30"
                )}>
                  <Icon className={cn("w-3.5 h-3.5 shrink-0", active ? "text-green-400" : "text-muted-foreground/40")} />
                  <span className={cn("text-xs", active ? "text-foreground" : "text-muted-foreground/50")}>{label}</span>
                  <span className={cn("ml-auto w-1.5 h-1.5 rounded-full shrink-0", active ? "bg-green-400" : "bg-border")} />
                </div>
              ))}
            </div>
          </div>

          {/* Execution Timeline */}
          {logs.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Execution Log</h3>
              <div className="rounded-md border border-border bg-[#0a0a10] p-3 max-h-52 overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                        log.status === "done" ? "bg-green-400" :
                        log.status === "waiting" ? "bg-yellow-400 animate-pulse" : "bg-blue-400 animate-pulse"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-[11px] font-mono leading-relaxed",
                          log.status === "waiting" ? "text-yellow-300" : "text-muted-foreground"
                        )}>{log.step}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-muted-foreground/50 font-mono">{log.ts}</span>
                          {log.confidence !== null && (
                            <span className="text-[9px] text-green-400/70">conf {log.confidence}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {runState === "running" && !approvalPending && (
                    <div className="flex items-center gap-1.5 pl-3.5 mt-1">
                      {[0, 150, 300].map((d) => (
                        <span key={d} className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>
          )}

          {/* Approval gate */}
          {approvalPending && (
            <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-yellow-400 shrink-0" />
                <p className="text-xs font-semibold text-yellow-300">Approval Required</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The agent is ready to submit the form. Review the filled values in the preview before approving.
              </p>
              <div className="flex gap-2 mt-1">
                <button onClick={handleApprove} className="flex-1 rounded-md bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-semibold py-1.5 hover:bg-yellow-500/30 transition-colors">
                  Approve &amp; Submit
                </button>
                <button onClick={handleStop} className="flex-1 rounded-md bg-destructive/10 text-destructive border border-destructive/30 text-xs font-medium py-1.5 hover:bg-destructive/20 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Safety Controls */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Safety Controls</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: "Approve before submit", value: requireApprovalBeforeSubmit, set: setRequireApprovalBeforeSubmit },
                { label: "Safe mode", value: safeMode, set: setSafeMode },
              ].map(({ label, value, set }) => (
                <label key={label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-md border border-border bg-secondary/30 cursor-pointer hover:bg-secondary transition-colors">
                  <button
                    role="switch"
                    aria-checked={value}
                    onClick={() => set(!value)}
                    className={cn("relative w-8 h-4 rounded-full border transition-colors shrink-0",
                      value ? "bg-primary border-primary" : "bg-border border-border"
                    )}
                  >
                    <span className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform",
                      value ? "translate-x-4" : "translate-x-0.5"
                    )} />
                  </button>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </label>
              ))}

              <button
                onClick={handleStop}
                className="mt-1 w-full rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-xs font-semibold py-2 hover:bg-destructive/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                Emergency Stop
              </button>
            </div>
          </div>

          {runState === "done" && (
            <div className="rounded-md border border-green-500/20 bg-green-500/5 p-3">
              <p className="text-xs font-semibold text-green-400 mb-1">Task Completed</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">All steps executed successfully. Review the execution log above for details.</p>
              <button onClick={() => { setRunState("idle"); setLogs([]); setShowElements(false) }} className="mt-2 text-[11px] text-muted-foreground border border-border rounded px-2.5 py-1 hover:bg-secondary transition-colors">
                Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
