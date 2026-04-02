// Types and seed data for MASE Copilot

export type Severity = "critical" | "high" | "medium" | "low"
export type Status = "queued" | "running" | "succeeded" | "failed" | "cancelled"
export type ModelTier = "fast" | "balanced" | "deep"
export type Screen = "overview" | "screen-agent" | "repositories" | "analysis" | "fixes" | "pull-requests" | "deployments" | "activity" | "settings"

export interface Repo {
  id: string
  name: string
  fullName: string
  language: string
  stars: number
  lastCommit: string
  branch: string
  openIssues: number
  healthScore: number
  status: "healthy" | "warning" | "critical"
  description: string
}

export interface Issue {
  id: string
  repoId: string
  title: string
  severity: Severity
  category: "security" | "performance" | "code-quality" | "dependency" | "api"
  filePath: string
  line?: number
  explanation: string
  recommendation: string
  confidence: number
  affectedFiles: string[]
  evidence: string
}

export interface Fix {
  issueId: string
  plan: string
  diff: string
  affectedFiles: string[]
  riskLevel: "low" | "medium" | "high"
  riskNotes: string
  estimatedImpact: string
}

export interface PullRequest {
  id: string
  repoId: string
  title: string
  branch: string
  baseBranch: string
  description: string
  checks: { name: string; status: "pass" | "fail" | "pending" }[]
  mergeReady: boolean
  issueIds: string[]
  createdAt: string
}

export interface Deployment {
  id: string
  repoId: string
  platform: "Vercel" | "Render" | "Railway" | "Fly.io"
  status: Status
  branch: string
  commit: string
  startedAt: string
  duration?: number
  url?: string
  logs: string[]
  metrics?: { buildTime: number; deployTime: number; size: string }
}

export interface ActivityItem {
  id: string
  type: "analysis" | "fix" | "pr" | "deploy" | "connect"
  title: string
  description: string
  timestamp: string
  status: "success" | "error" | "running" | "pending"
  repoName?: string
  model?: ModelTier
}

// ── Seed Data ──────────────────────────────────────────────────────────────

export const REPOS: Repo[] = [
  {
    id: "r1",
    name: "api-gateway",
    fullName: "acme/api-gateway",
    language: "TypeScript",
    stars: 312,
    lastCommit: "2h ago",
    branch: "main",
    openIssues: 7,
    healthScore: 62,
    status: "warning",
    description: "Central API gateway with rate limiting and auth middleware",
  },
  {
    id: "r2",
    name: "data-pipeline",
    fullName: "acme/data-pipeline",
    language: "Python",
    stars: 88,
    lastCommit: "5h ago",
    branch: "main",
    openIssues: 12,
    healthScore: 41,
    status: "critical",
    description: "Real-time data ingestion and processing pipeline",
  },
  {
    id: "r3",
    name: "frontend-app",
    fullName: "acme/frontend-app",
    language: "TypeScript",
    stars: 540,
    lastCommit: "30m ago",
    branch: "main",
    openIssues: 3,
    healthScore: 87,
    status: "healthy",
    description: "Next.js 15 consumer-facing web application",
  },
  {
    id: "r4",
    name: "ml-inference",
    fullName: "acme/ml-inference",
    language: "Python",
    stars: 204,
    lastCommit: "1d ago",
    branch: "develop",
    openIssues: 5,
    healthScore: 71,
    status: "warning",
    description: "ML model serving with FastAPI and batching support",
  },
]

export const ISSUES: Issue[] = [
  {
    id: "i1",
    repoId: "r1",
    title: "SQL injection vulnerability in user search endpoint",
    severity: "critical",
    category: "security",
    filePath: "src/routes/users.ts",
    line: 47,
    explanation:
      "Raw user input is interpolated directly into a SQL query string without parameterization. An attacker can craft input to extract arbitrary data or drop tables.",
    recommendation: "Replace string interpolation with parameterized queries using the pg library's $1, $2 placeholders.",
    confidence: 97,
    affectedFiles: ["src/routes/users.ts", "src/db/queries.ts"],
    evidence:
      "Inspected 14 files. Found direct string concatenation in 3 query builder calls. No input sanitization layer detected. Pattern matches OWASP A03:2021.",
  },
  {
    id: "i2",
    repoId: "r1",
    title: "Missing rate limiting on authentication endpoints",
    severity: "high",
    category: "security",
    filePath: "src/middleware/auth.ts",
    line: 12,
    explanation:
      "The /auth/login and /auth/refresh endpoints have no brute-force protection. An attacker can make unlimited attempts to guess credentials.",
    recommendation: "Apply express-rate-limit middleware with a sliding window of max 5 requests per minute per IP on all auth routes.",
    confidence: 94,
    affectedFiles: ["src/middleware/auth.ts", "src/app.ts"],
    evidence: "Traced all route registrations. Neither express-rate-limit nor any custom throttling middleware is applied to auth paths.",
  },
  {
    id: "i3",
    repoId: "r1",
    title: "N+1 query pattern in orders list endpoint",
    severity: "high",
    category: "performance",
    filePath: "src/routes/orders.ts",
    line: 89,
    explanation:
      "For each order in the list, a separate database query fetches the associated user. With 500 orders, this triggers 501 queries per request.",
    recommendation: "Rewrite using a JOIN query or fetch all user IDs in a single IN clause after the initial orders fetch.",
    confidence: 91,
    affectedFiles: ["src/routes/orders.ts", "src/db/queries.ts"],
    evidence: "Traced execution path through 6 files. Query loop confirmed with async/await pattern. No DataLoader or batch-fetch detected.",
  },
  {
    id: "i4",
    repoId: "r2",
    title: "Unhandled exception swallows pipeline errors silently",
    severity: "critical",
    category: "code-quality",
    filePath: "pipeline/processor.py",
    line: 134,
    explanation:
      "A bare except clause catches all exceptions including KeyboardInterrupt and SystemExit, then logs a generic message without re-raising. Failures are invisible in production.",
    recommendation: "Replace bare except with specific exception types. Re-raise or alert on unexpected errors. Add structured logging with error context.",
    confidence: 99,
    affectedFiles: ["pipeline/processor.py", "pipeline/runner.py"],
    evidence: "Found bare except pattern in 4 locations. Exception telemetry shows 0 errors reported despite known failures in staging.",
  },
  {
    id: "i5",
    repoId: "r2",
    title: "Dependency: requests 2.26.0 has known CVE",
    severity: "high",
    category: "dependency",
    filePath: "requirements.txt",
    line: 8,
    explanation:
      "requests==2.26.0 is pinned and has CVE-2023-32681 (credential leakage via redirect). Current secure version is 2.31.0.",
    recommendation: "Update requirements.txt to requests>=2.31.0 and run pip-audit to check for additional CVEs.",
    confidence: 100,
    affectedFiles: ["requirements.txt"],
    evidence: "Matched version string against NVD CVE database. Confirmed affected range <2.31.0.",
  },
  {
    id: "i6",
    repoId: "r4",
    title: "Model weights loaded on every request instead of startup",
    severity: "medium",
    category: "performance",
    filePath: "app/inference.py",
    line: 22,
    explanation:
      "The model is loaded from disk inside the predict() handler function. This adds 2-4 seconds of latency to every inference request.",
    recommendation: "Move model loading to application startup using FastAPI's lifespan context manager and cache in a module-level variable.",
    confidence: 88,
    affectedFiles: ["app/inference.py", "app/main.py"],
    evidence: "Profiled 50 requests. P99 latency is 4.2s. Model load accounts for 3.8s of that. Cold path executed on 100% of requests.",
  },
]

export const FIXES: Fix[] = [
  {
    issueId: "i1",
    plan: "1. Audit all query builder calls in src/db/queries.ts\n2. Replace string interpolation with $1/$2 parameterized placeholders\n3. Add input validation schema using zod at the route level\n4. Add integration test to verify injection attempt is rejected",
    diff: `--- a/src/routes/users.ts
+++ b/src/routes/users.ts
@@ -44,7 +44,8 @@ router.get('/search', async (req, res) => {
-  const query = \`SELECT * FROM users WHERE name LIKE '%\${req.query.q}%'\`;
-  const result = await db.query(query);
+  const result = await db.query(
+    'SELECT * FROM users WHERE name ILIKE $1',
+    [\`%\${req.query.q}%\`]
+  );
   res.json(result.rows);`,
    affectedFiles: ["src/routes/users.ts", "src/db/queries.ts"],
    riskLevel: "low",
    riskNotes: "Pure security fix with no behavior change. Query results are identical for valid input.",
    estimatedImpact: "Eliminates critical SQL injection vector. No performance impact.",
  },
  {
    issueId: "i4",
    plan: "1. Replace bare except clauses with specific exception types\n2. Add structured error context to log output\n3. Re-raise unexpected exceptions after logging\n4. Add Sentry/OpenTelemetry span for error tracking",
    diff: `--- a/pipeline/processor.py
+++ b/pipeline/processor.py
@@ -131,8 +131,12 @@ class Processor:
-  except:
-    logger.error("Processing failed")
+  except (ValueError, KeyError) as e:
+    logger.error("Processing failed: expected error", extra={"error": str(e), "record_id": record.id})
+    raise
+  except Exception as e:
+    logger.critical("Unexpected error in processor", extra={"error": str(e)}, exc_info=True)
+    raise`,
    affectedFiles: ["pipeline/processor.py"],
    riskLevel: "medium",
    riskNotes: "Changing exception propagation may surface errors previously swallowed. Verify error handling in calling code.",
    estimatedImpact: "Makes all pipeline failures visible. Enables proper alerting and debugging.",
  },
]

export const PULL_REQUESTS: PullRequest[] = [
  {
    id: "pr1",
    repoId: "r1",
    title: "fix: parameterize SQL queries to prevent injection (MASE-i1)",
    branch: "mase/fix-sql-injection-i1",
    baseBranch: "main",
    description:
      "## Summary\nPatches the SQL injection vulnerability in the user search endpoint by replacing string interpolation with parameterized queries.\n\n## Changes\n- `src/routes/users.ts`: Parameterized search query\n- `src/db/queries.ts`: Updated query builder helpers\n\n## Testing\n- Added integration test that verifies injection attempt returns 400\n- Existing tests pass\n\n_Generated by MASE Copilot — reviewed by Claude Opus 4_",
    checks: [
      { name: "TypeScript", status: "pass" },
      { name: "ESLint", status: "pass" },
      { name: "Jest Tests", status: "pass" },
      { name: "Security Scan", status: "pass" },
    ],
    mergeReady: true,
    issueIds: ["i1"],
    createdAt: "10m ago",
  },
  {
    id: "pr2",
    repoId: "r2",
    title: "fix: replace bare except clauses with typed exception handling (MASE-i4)",
    branch: "mase/fix-exception-handling-i4",
    baseBranch: "main",
    description:
      "## Summary\nReplaces bare `except:` clauses in the data pipeline processor with typed exception handling and structured logging.\n\n## Changes\n- `pipeline/processor.py`: Specific exception types with context logging\n- `pipeline/runner.py`: Updated caller to handle raised exceptions\n\n_Generated by MASE Copilot — reviewed by Claude Opus 4_",
    checks: [
      { name: "Flake8", status: "pass" },
      { name: "mypy", status: "pending" },
      { name: "pytest", status: "pass" },
      { name: "Security Scan", status: "pass" },
    ],
    mergeReady: false,
    issueIds: ["i4"],
    createdAt: "2h ago",
  },
]

export const DEPLOYMENTS: Deployment[] = [
  {
    id: "d1",
    repoId: "r3",
    platform: "Vercel",
    status: "succeeded",
    branch: "main",
    commit: "a3f9c21",
    startedAt: "12m ago",
    duration: 48,
    url: "https://frontend-app-acme.vercel.app",
    logs: [
      "[00:00] Cloning repository...",
      "[00:03] Installing dependencies (pnpm install)...",
      "[00:18] Running build (next build)...",
      "[00:42] Build completed. 24 pages generated.",
      "[00:46] Deploying to Vercel Edge Network...",
      "[00:48] Deployment live at https://frontend-app-acme.vercel.app",
    ],
    metrics: { buildTime: 39, deployTime: 9, size: "2.4 MB" },
  },
  {
    id: "d2",
    repoId: "r1",
    platform: "Render",
    status: "running",
    branch: "mase/fix-sql-injection-i1",
    commit: "b71e4d8",
    startedAt: "3m ago",
    logs: [
      "[00:00] Build started...",
      "[00:04] Installing Node.js 20.x...",
      "[00:09] npm install...",
      "[00:31] npm run build...",
      "[00:44] Build succeeded. Starting container...",
    ],
    metrics: undefined,
  },
  {
    id: "d3",
    repoId: "r2",
    platform: "Railway",
    status: "failed",
    branch: "main",
    commit: "c44a901",
    startedAt: "1h ago",
    duration: 67,
    logs: [
      "[00:00] Build started...",
      "[00:08] pip install -r requirements.txt...",
      "[00:51] ERROR: Could not find a version that satisfies the requirement torch==2.1.0",
      "[01:07] Build failed.",
    ],
  },
  {
    id: "d4",
    repoId: "r4",
    platform: "Fly.io",
    status: "queued",
    branch: "develop",
    commit: "e19f330",
    startedAt: "just now",
    logs: ["[00:00] Queued. Waiting for builder..."],
  },
]

export const ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    type: "analysis",
    title: "Deep analysis completed",
    description: "Found 7 issues across api-gateway — 2 critical, 3 high",
    timestamp: "8m ago",
    status: "success",
    repoName: "acme/api-gateway",
    model: "deep",
  },
  {
    id: "a2",
    type: "fix",
    title: "Patch generated",
    description: "SQL injection fix ready for review — confidence 97%",
    timestamp: "10m ago",
    status: "success",
    repoName: "acme/api-gateway",
    model: "deep",
  },
  {
    id: "a3",
    type: "pr",
    title: "Pull request opened",
    description: "mase/fix-sql-injection-i1 → main — all checks passing",
    timestamp: "10m ago",
    status: "success",
    repoName: "acme/api-gateway",
  },
  {
    id: "a4",
    type: "deploy",
    title: "Deployment succeeded",
    description: "frontend-app deployed to Vercel in 48s",
    timestamp: "12m ago",
    status: "success",
    repoName: "acme/frontend-app",
  },
  {
    id: "a5",
    type: "analysis",
    title: "Analysis running",
    description: "Scanning data-pipeline for security and quality issues...",
    timestamp: "15m ago",
    status: "running",
    repoName: "acme/data-pipeline",
    model: "deep",
  },
  {
    id: "a6",
    type: "deploy",
    title: "Deployment failed",
    description: "data-pipeline build error — torch dependency conflict",
    timestamp: "1h ago",
    status: "error",
    repoName: "acme/data-pipeline",
  },
]

export const MODELS = [
  {
    id: "fast" as ModelTier,
    label: "Fast",
    provider: "Groq / Llama 3.1",
    description: "Low latency, lightweight tasks",
    badges: ["~200ms", "Low cost"],
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    id: "balanced" as ModelTier,
    label: "Balanced",
    provider: "OpenAI GPT-4o",
    description: "General analysis and code generation",
    badges: ["~2s", "Mid cost"],
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    id: "deep" as ModelTier,
    label: "Deep Reasoning",
    provider: "Anthropic Claude Opus",
    description: "Architecture review, root-cause, complex refactors",
    badges: ["~8s", "High intelligence"],
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    recommended: true,
  },
]
