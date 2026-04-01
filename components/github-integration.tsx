"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Github, GitBranch, Plus, ExternalLink, CheckCircle, AlertCircle, Clock, Rocket } from "lucide-react"

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

interface DeploymentStatus {
  id: string
  repository: string
  status: "pending" | "building" | "deployed" | "failed"
  url?: string
  created_at: string
}

export function GitHubIntegration() {
  const [githubToken, setGithubToken] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [selectedRepo, setSelectedRepo] = useState("")
  const [newRepoName, setNewRepoName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [deployments, setDeployments] = useState<DeploymentStatus[]>([])
  const { toast } = useToast()

  // Check if already connected on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("github_token")
      if (savedToken) {
        setGithubToken(savedToken)
        setIsConnected(true)
        fetchRepositories(savedToken).catch((error) => {
          console.error("Failed to fetch repositories on mount:", error)
        })
      }
    } catch (error) {
      console.error("Error checking saved GitHub token:", error)
    }
  }, [])

  const connectGitHub = async () => {
    if (!githubToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter your GitHub Personal Access Token",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Test the token by fetching user info
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (response.ok) {
        localStorage.setItem("github_token", githubToken)
        setIsConnected(true)
        await fetchRepositories(githubToken)
        toast({
          title: "Success",
          description: "Connected to GitHub successfully!",
        })
      } else {
        throw new Error("Invalid token")
      }
    } catch (error) {
      console.error("GitHub connection error:", error)
      toast({
        title: "Connection Failed",
        description: "Invalid GitHub token. Please check your token and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRepositories = async (token: string) => {
    try {
      const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=50", {
        headers: {
          Authorization: `token ${token}`,
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
      console.error("Failed to fetch repositories:", error)
      toast({
        title: "Warning",
        description: "Could not fetch repositories. Please check your connection.",
        variant: "destructive",
      })
    }
  }

  const createRepository = async () => {
    if (!newRepoName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a repository name",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newRepoName,
          description: `Repository created via MASE Platform`,
          private: false,
          auto_init: true,
        }),
      })

      if (response.ok) {
        const newRepo = await response.json()
        setRepositories((prev) => [newRepo, ...prev])
        setNewRepoName("")
        toast({
          title: "Success",
          description: `Repository "${newRepoName}" created successfully!`,
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to create repository")
      }
    } catch (error) {
      console.error("Repository creation error:", error)
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create repository. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deployRepository = async (repoName: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repository: repoName,
          githubToken: githubToken,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const newDeployment: DeploymentStatus = {
          id: Date.now().toString(),
          repository: repoName,
          status: "pending",
          created_at: new Date().toISOString(),
        }
        setDeployments((prev) => [newDeployment, ...prev])

        toast({
          title: "Deployment Started",
          description: `Deploying ${repoName} to production...`,
        })

        // Simulate deployment progress
        setTimeout(() => {
          setDeployments((prev) =>
            prev.map((d) => (d.id === newDeployment.id ? { ...d, status: "building" as const } : d)),
          )
        }, 2000)

        setTimeout(() => {
          setDeployments((prev) =>
            prev.map((d) =>
              d.id === newDeployment.id
                ? {
                    ...d,
                    status: "deployed" as const,
                    url: `https://${repoName.split("/")[1] || repoName}.onrender.com`,
                  }
                : d,
            ),
          )
        }, 8000)
      } else {
        throw new Error("Deployment failed")
      }
    } catch (error) {
      console.error("Deployment error:", error)
      toast({
        title: "Deployment Failed",
        description: "Failed to deploy repository. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: DeploymentStatus["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "building":
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case "deployed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const disconnect = () => {
    try {
      localStorage.removeItem("github_token")
      setGithubToken("")
      setIsConnected(false)
      setRepositories([])
      setSelectedRepo("")
      setDeployments([])
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from GitHub",
      })
    } catch (error) {
      console.error("Error disconnecting from GitHub:", error)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Connect to GitHub
          </CardTitle>
          <CardDescription>Connect your GitHub account to manage repositories and deploy projects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="github-token">GitHub Personal Access Token</Label>
            <Input
              id="github-token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              {"Create a token at "}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
                aria-label="Open GitHub Personal Access Tokens settings in a new tab"
              >
                {"GitHub Settings → Developer settings → Personal access tokens"}
              </a>
              {" (or use "}
              <a
                href="https://github.com/settings/personal-access-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
                aria-label="Open GitHub Fine-grained Personal Access Tokens settings in a new tab"
              >
                {"fine-grained tokens"}
              </a>
              {")"}
            </p>
          </div>
          <Button onClick={connectGitHub} disabled={isLoading} className="w-full">
            <Github className="h-4 w-4 mr-2" />
            {isLoading ? "Connecting..." : "Connect GitHub"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              GitHub Connected
            </div>
            <Button variant="outline" size="sm" onClick={disconnect}>
              Disconnect
            </Button>
          </CardTitle>
          <CardDescription>
            Successfully connected to GitHub. You can now manage repositories and deploy projects.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Repository Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Repository
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repo-name">Repository Name</Label>
              <Input
                id="repo-name"
                placeholder="my-awesome-project"
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
              />
            </div>
            <Button onClick={createRepository} disabled={isLoading} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {isLoading ? "Creating..." : "Create Repository"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Select Repository
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repo-select">Choose Repository</Label>
              <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a repository..." />
                </SelectTrigger>
                <SelectContent>
                  {repositories.map((repo) => (
                    <SelectItem key={repo.id} value={repo.full_name}>
                      <div className="flex items-center gap-2">
                        <span>{repo.name}</span>
                        {repo.private && <Badge variant="secondary">Private</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedRepo && (
              <Button onClick={() => deployRepository(selectedRepo)} disabled={isLoading} className="w-full">
                <Rocket className="h-4 w-4 mr-2" />
                Deploy Repository
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Repositories List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Repositories</CardTitle>
          <CardDescription>Manage and deploy your GitHub repositories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {repositories.slice(0, 10).map((repo) => (
              <div key={repo.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <GitBranch className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{repo.name}</h4>
                      {repo.private && <Badge variant="secondary">Private</Badge>}
                      {repo.language && <Badge variant="outline">{repo.language}</Badge>}
                    </div>
                    <p className="text-sm text-gray-500">{repo.description || "No description"}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>⭐ {repo.stargazers_count}</span>
                      <span>🍴 {repo.forks_count}</span>
                      <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.open(repo.html_url, "_blank")}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={() => deployRepository(repo.full_name)} disabled={isLoading}>
                    <Rocket className="h-4 w-4 mr-2" />
                    Deploy
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Status */}
      {deployments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Deployments</CardTitle>
            <CardDescription>Track your deployment status and access deployed applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deployments.map((deployment) => (
                <div key={deployment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(deployment.status)}
                    <div>
                      <h4 className="font-medium">{deployment.repository}</h4>
                      <p className="text-sm text-gray-500">
                        {deployment.status === "deployed"
                          ? "Successfully deployed"
                          : deployment.status === "building"
                            ? "Building application..."
                            : deployment.status === "pending"
                              ? "Deployment queued"
                              : "Deployment failed"}
                      </p>
                      <span className="text-xs text-gray-500">{new Date(deployment.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  {deployment.url && deployment.status === "deployed" && (
                    <Button variant="outline" size="sm" onClick={() => window.open(deployment.url, "_blank")}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View App
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
