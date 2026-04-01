"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Code,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Play,
  Bug,
  Shield,
  Zap,
  Copy,
  ExternalLink,
  Terminal,
  FileText,
  Rocket,
  Database,
} from "lucide-react"

interface Repository {
  id: number
  name: string
  full_name: string
  private: boolean
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
}

interface Issue {
  id: string
  title: string
  description: string
  severity: "low" | "medium" | "high"
  category: "dependency" | "performance" | "security" | "code-quality"
  file?: string
  line?: number
  suggestion: string
  status: "pending" | "analyzing" | "fixed"
}

interface ApiEndpoint {
  id: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  description?: string
  status: "not-tested" | "testing" | "passed" | "failed"
  responseTime?: number
  statusCode?: number
  lastTested?: string
}

interface CodingIssue {
  id: string
  type: string
  severity: string
  description: string
  file: string
  line?: number
  status: string
  suggestion: string
}

interface FixDetails {
  title: string
  explanation: string
  steps?: string[]
  commands?: { label: string; cmd: string }[]
  code?: string
}

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || ""

export function CodingDashboard() {
  const [selectedRepo, setSelectedRepo] = useState("")
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isFixing, setIsFixing] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [activeTab, setActiveTab] = useState("issues")
  const [apiBaseUrl, setApiBaseUrl] = useState("")
  const [viewFixDialog, setViewFixDialog] = useState<Issue | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [showFix, setShowFix] = useState(false)
  const [activeIssue, setActiveIssue] = useState<CodingIssue | null>(null)
  const [apiBase, setApiBase] = useState<string>(DEFAULT_API_BASE)
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    { id: "1", method: "GET", path: "/api/health", status: "not-tested", description: "Health check endpoint" },
    { id: "2", method: "GET", path: "/api/users", status: "not-tested", description: "Get all users" },
    { id: "3", method: "POST", path: "/api/auth", status: "not-tested", description: "User authentication" },
  ])
  const { toast } = useToast()

  useEffect(() => {
    loadRepositories()
    setApiBaseUrl(process.env.NEXT_PUBLIC_BACKEND_URL || "https://ai-on-screen.onrender.com")
  }, [])

  const loadRepositories = async () => {
    try {
      const savedToken = localStorage.getItem("github_token")
      if (!savedToken) {
        setIsConnected(false)
        return
      }

      setIsConnected(true)
      const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=50", {
        headers: {
          Authorization: `token ${savedToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (response.ok) {
        const repos = await response.json()
        setRepositories(repos)
      } else {
        throw new Error("Failed to fetch repositories")
      }
    } catch (error) {
      console.error("Failed to load repositories:", error)
      setIsConnected(false)
    }
  }

  const analyzeRepository = async () => {
    if (!selectedRepo) {
      toast({
        title: "Error",
        description: "Please select a repository to analyze",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setIssues([])
    setApiEndpoints([])

    try {
      const response = await fetch("/api/analyze-repository", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repository: selectedRepo,
          githubToken: localStorage.getItem("github_token"),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setIssues(result.issues || [])
        setApiEndpoints(result.apiEndpoints || [])

        toast({
          title: "Analysis Complete",
          description: `Found ${result.issues?.length || 0} issues and ${result.apiEndpoints?.length || 0} API endpoints`,
        })
      } else {
        throw new Error("Analysis failed")
      }
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze repository. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const fixIssue = async (issueId: string) => {
    const issue = issues.find((i) => i.id === issueId)
    if (!issue) return

    if (issue.status === "fixed") {
      setViewFixDialog(issue)
      return
    }

    setIsFixing(issueId)

    try {
      // Update issue status to analyzing
      setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, status: "analyzing" as const } : i)))

      // Simulate fix process
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Mark as fixed
      setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, status: "fixed" as const } : i)))

      toast({
        title: "Issue Fixed",
        description: `Successfully resolved: ${issue.title}`,
      })
    } catch (error) {
      console.error("Fix error:", error)
      toast({
        title: "Fix Failed",
        description: "Failed to fix issue. Please try again.",
        variant: "destructive",
      })

      // Reset status on error
      setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, status: "pending" as const } : i)))
    } finally {
      setIsFixing(null)
    }
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: "Copied", description: "Copied to clipboard" })
    } catch {
      toast({ title: "Copy failed", description: "Unable to copy", variant: "destructive" })
    }
  }

  const selectedRepoShort = useMemo(() => {
    if (!selectedRepo) return ""
    const parts = selectedRepo.split("/")
    return parts[1] || selectedRepo
  }, [selectedRepo])

  // API testing
  const testEndpoint = async (endpointId: string) => {
    const endpoint = apiEndpoints.find((e) => e.id === endpointId)
    if (!endpoint) return

    setApiEndpoints((prev) => prev.map((e) => (e.id === endpointId ? { ...e, status: "testing" as const } : e)))

    try {
      const startTime = Date.now()
      const response = await fetch("/api/api-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: endpoint.method,
          path: endpoint.path,
          baseUrl: apiBaseUrl,
        }),
      })

      const responseTime = Date.now() - startTime
      const result = await response.json()

      setApiEndpoints((prev) =>
        prev.map((e) =>
          e.id === endpointId
            ? {
                ...e,
                status: result.success ? ("passed" as const) : ("failed" as const),
                responseTime,
                statusCode: result.statusCode,
                lastTested: new Date().toISOString(),
              }
            : e,
        ),
      )

      toast({
        title: result.success ? "Test Passed" : "Test Failed",
        description: `${endpoint.method} ${endpoint.path} - ${result.statusCode} (${responseTime}ms)`,
        variant: result.success ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Test error:", error)
      setApiEndpoints((prev) =>
        prev.map((e) =>
          e.id === endpointId
            ? {
                ...e,
                status: "failed" as const,
                lastTested: new Date().toISOString(),
              }
            : e,
        ),
      )

      toast({
        title: "Test Failed",
        description: `Failed to test ${endpoint.path}`,
        variant: "destructive",
      })
    }
  }

  const testAllEndpoints = async () => {
    setIsTesting(true)

    for (const endpoint of apiEndpoints) {
      await testEndpoint(endpoint.id)
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsTesting(false)
    toast({
      title: "All Tests Complete",
      description: "Finished testing all API endpoints",
    })
  }

  const getCategoryIcon = (category: Issue["category"]) => {
    switch (category) {
      case "security":
        return <Shield className="h-4 w-4" />
      case "performance":
        return <Zap className="h-4 w-4" />
      case "dependency":
        return <GitBranch className="h-4 w-4" />
      case "code-quality":
        return <Code className="h-4 w-4" />
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Copied to clipboard",
      })
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const getFixInstructions = (issue: Issue) => {
    switch (issue.category) {
      case "dependency":
        return {
          steps: [
            "Run security audit to identify vulnerabilities",
            "Update vulnerable packages to latest versions",
            "Review and test updated dependencies",
            "Commit the updated package files",
          ],
          commands: [
            "npm audit",
            "npm audit fix",
            "npm test",
            "git add package*.json && git commit -m 'fix: update vulnerable dependencies'",
          ],
          code: `// Check for outdated packages
npm outdated

// Update all packages to latest
npm update

// For major version updates
npm install package-name@latest`,
        }
      case "performance":
        return {
          steps: [
            "Analyze bundle size and identify large chunks",
            "Implement code splitting using React.lazy() or dynamic imports",
            "Split routes and components into separate bundles",
            "Test performance improvements and loading times",
          ],
          commands: [
            "npm install --save-dev webpack-bundle-analyzer",
            "npm run build -- --analyze",
            "npm run lighthouse",
            "npm test",
          ],
          code: `// Implement code splitting with React.lazy()
import { lazy, Suspense } from 'react'

const LazyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  )
}`,
        }
      case "security":
        return {
          steps: [
            "Scan commit history for sensitive data",
            "Remove any exposed secrets or API keys",
            "Add sensitive files to .gitignore",
            "Rotate any compromised credentials",
          ],
          commands: [
            "git log --all --full-history -- '**/config*' '**/env*'",
            "git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch path/to/sensitive/file'",
            "echo 'sensitive-file.txt' >> .gitignore",
            "git add .gitignore && git commit -m 'chore: add sensitive files to gitignore'",
          ],
          code: `// Use environment variables for sensitive data
const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  dbUrl: process.env.DATABASE_URL,
  secretKey: process.env.SECRET_KEY
}

// Never commit files like:
// .env
// .env.local
// config/secrets.json
// private-keys/`,
        }
      default:
        return {
          steps: [
            "Review the code quality issue",
            "Apply recommended best practices",
            "Run linting and formatting tools",
            "Test the changes thoroughly",
          ],
          commands: [
            "npm run lint",
            "npm run format",
            "npm test",
            "git add . && git commit -m 'refactor: improve code quality'",
          ],
          code: `// Follow coding best practices
// Use consistent naming conventions
// Add proper error handling
// Write comprehensive tests
// Document complex logic`,
        }
    }
  }

  const getEndpointStatusColor = (status: ApiEndpoint["status"]) => {
    switch (status) {
      case "passed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "testing":
        return "bg-blue-100 text-blue-800"
      case "not-tested":
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Code Analysis
          </CardTitle>
          <CardDescription>Connect to GitHub first to analyze your repositories</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-500 mb-4">
            Please connect your GitHub account in the GitHub tab to start analyzing your code.
          </p>
          <Button variant="outline" onClick={() => (window.location.hash = "#github")}>
            Connect GitHub
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Repository Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Repository Analysis
          </CardTitle>
          <CardDescription>
            Select a repository to analyze for code issues, security vulnerabilities, and optimization opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="repo-select">Repository</Label>
              <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a repository to analyze..." />
                </SelectTrigger>
                <SelectContent>
                  {repositories.map((repo) => (
                    <SelectItem key={repo.id} value={repo.full_name}>
                      <div className="flex items-center gap-2">
                        <span>{repo.name}</span>
                        {repo.language && <Badge variant="outline">{repo.language}</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={analyzeRepository} disabled={isAnalyzing || !selectedRepo} className="self-end">
              <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </div>

          {selectedRepo && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected:</strong> {repositories.find((r) => r.full_name === selectedRepo)?.name}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                AI will analyze this repository for code issues, security vulnerabilities, and optimization
                opportunities.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Issues ({issues.length})
          </TabsTrigger>
          <TabsTrigger value="git-status">Git Status</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="api-testing">API Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Code Issues & Fixes
                {selectedRepo && <Badge variant="outline">{selectedRepoShort}</Badge>}
              </CardTitle>
              <CardDescription>
                AI-detected issues and automated fixes for {selectedRepo || "your repository"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>No issues found yet</p>
                    <p className="text-sm mt-2">Select a repository and click Analyze to scan for issues</p>
                  </div>
                ) : (
                  issues.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(issue.status)}
                            {getCategoryIcon(issue.category)}
                            <Badge className={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                            <Badge variant="outline">{issue.category}</Badge>
                          </div>
                          <h3 className="font-medium mb-2">{issue.title}</h3>
                          {issue.file && (
                            <p className="text-sm text-gray-600 mb-2">
                              {issue.file}
                              {issue.line && `:${issue.line}`}
                            </p>
                          )}
                          <p className="text-sm text-blue-600 mb-2">
                            <strong>Suggestion:</strong> {issue.suggestion}
                          </p>
                        </div>
                        <Button
                          onClick={() => fixIssue(issue.id)}
                          disabled={isFixing === issue.id}
                          size="sm"
                          variant={issue.status === "fixed" ? "outline" : "default"}
                        >
                          {isFixing === issue.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : issue.status === "fixed" ? (
                            "View Fix"
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Auto Fix
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="git-status">
          <Card>
            <CardHeader>
              <CardTitle>Git Repository Status</CardTitle>
              <CardDescription>Current git status and recent commits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <GitBranch className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>Git status will be displayed here</p>
                <p className="text-sm mt-2">Connect to repository to view git information</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Status</CardTitle>
              <CardDescription>Current deployment status and history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Rocket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>Deployment information will be displayed here</p>
                <p className="text-sm mt-2">Deploy your repository to see status updates</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                API Endpoints
                {selectedRepo && <Badge variant="outline">{selectedRepoShort}</Badge>}
              </CardTitle>
              <CardDescription>Test endpoints against your API base URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* API Base URL Configuration */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="api-base-url">API Base URL</Label>
                  <Input
                    id="api-base-url"
                    placeholder="https://your-api.com"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                  />
                </div>
                <Button
                  onClick={testAllEndpoints}
                  disabled={isTesting || apiEndpoints.length === 0}
                  className="self-end"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isTesting ? "Testing..." : "Test All"}
                </Button>
              </div>

              {/* API Endpoints List */}
              <div className="space-y-3">
                {apiEndpoints.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Terminal className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>No API endpoints detected</p>
                    <p className="text-sm mt-2">Analyze a repository to detect API endpoints</p>
                  </div>
                ) : (
                  apiEndpoints.map((endpoint) => (
                    <div key={endpoint.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm">{endpoint.path}</code>
                        {endpoint.description && (
                          <span className="text-sm text-gray-500">• {endpoint.description}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getEndpointStatusColor(endpoint.status)}>
                          {endpoint.status === "not-tested"
                            ? "Not tested"
                            : endpoint.status === "testing"
                              ? "Testing..."
                              : endpoint.status === "passed"
                                ? `✓ ${endpoint.statusCode}`
                                : `✗ ${endpoint.statusCode || "Failed"}`}
                        </Badge>
                        {endpoint.responseTime && (
                          <span className="text-xs text-gray-500">{endpoint.responseTime}ms</span>
                        )}
                        <Button
                          onClick={() => testEndpoint(endpoint.id)}
                          disabled={endpoint.status === "testing"}
                          size="sm"
                          variant="outline"
                        >
                          {endpoint.status === "testing" ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Test"}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Fix Dialog */}
      <Dialog open={!!viewFixDialog} onOpenChange={() => setViewFixDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Fix Applied: {viewFixDialog?.title}
            </DialogTitle>
            <DialogDescription>
              Here's how this issue was resolved with step-by-step instructions and code examples.
            </DialogDescription>
          </DialogHeader>

          {viewFixDialog && (
            <div className="space-y-6">
              {/* Issue Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryIcon(viewFixDialog.category)}
                  <Badge className={getSeverityColor(viewFixDialog.severity)}>{viewFixDialog.severity}</Badge>
                  <Badge variant="outline">{viewFixDialog.category}</Badge>
                </div>
                <p className="text-sm text-gray-700">{viewFixDialog.description}</p>
                {viewFixDialog.file && (
                  <p className="text-xs text-gray-500 mt-2">
                    File: {viewFixDialog.file}
                    {viewFixDialog.line && `:${viewFixDialog.line}`}
                  </p>
                )}
              </div>

              {(() => {
                const fixInstructions = getFixInstructions(viewFixDialog)
                return (
                  <div className="space-y-4">
                    {/* Steps */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Resolution Steps
                      </h4>
                      <ol className="space-y-2">
                        {fixInstructions.steps?.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Commands */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Terminal className="h-4 w-4" />
                        Commands to Run
                      </h4>
                      <div className="space-y-2">
                        {fixInstructions.commands?.map((command, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-3 bg-gray-900 text-green-400 rounded-lg font-mono text-sm"
                          >
                            <span className="flex-1">$ {command}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(command)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Code Example */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Code Example
                      </h4>
                      <div className="relative">
                        <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-sm overflow-x-auto">
                          <code>{fixInstructions.code}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(fixInstructions.code || "")}
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Additional Resources */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Additional Resources
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Check the official documentation for best practices</li>
                        <li>• Run tests after applying fixes to ensure nothing breaks</li>
                        <li>• Consider setting up automated checks to prevent similar issues</li>
                        <li>• Review related files that might need similar updates</li>
                      </ul>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

const getStatusIcon = (status: Issue["status"]) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4 text-gray-500" />
    case "analyzing":
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    case "fixed":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    default:
      return <AlertTriangle className="h-4 w-4 text-red-500" />
  }
}

const getSeverityColor = (severity: Issue["severity"]) => {
  switch (severity) {
    case "high":
      return "bg-red-100 text-red-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "low":
      return "bg-green-100 text-green-800"
  }
}
