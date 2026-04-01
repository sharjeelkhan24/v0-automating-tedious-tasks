"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Rocket,
  GitBranch,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  DollarSign,
  Activity,
  Users,
  Globe,
  TrendingUp,
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

interface DeploymentStatus {
  id: string
  repository: string
  platform: string
  status: "pending" | "building" | "deployed" | "failed"
  url?: string
  created_at: string
  updated_at: string
  cost?: number
  metrics?: {
    requests: number
    uptime: number
    responseTime: number
  }
}

interface PlatformConfig {
  id: string
  name: string
  icon: string
  description: string
  pricing: string
  features: string[]
  status: "connected" | "disconnected"
}

interface DeploymentMetric {
  name: string
  value: string
  change: string
  trend: "up" | "down" | "stable"
}

export function DeploymentDashboard() {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [selectedRepo, setSelectedRepo] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState("")
  const [deployments, setDeployments] = useState<DeploymentStatus[]>([])
  const [isDeploying, setIsDeploying] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("deploy")
  const [metrics, setMetrics] = useState<DeploymentMetric[]>([
    { name: "Total Requests", value: "18,203", change: "+4.2%", trend: "up" },
    { name: "Response Time", value: "212 ms", change: "-6.1%", trend: "up" },
    { name: "Error Rate", value: "0.21%", change: "-0.05%", trend: "up" },
    { name: "Uptime", value: "99.9%", change: "0%", trend: "stable" },
  ])
  const { toast } = useToast()

  const platforms: PlatformConfig[] = [
    {
      id: "vercel",
      name: "Vercel",
      icon: "▲",
      description: "Frontend deployment platform with global CDN",
      pricing: "Free tier available, $20/month Pro",
      features: ["Automatic deployments", "Custom domains", "Analytics", "Edge functions"],
      status: "connected",
    },
    {
      id: "render",
      name: "Render",
      icon: "🎯",
      description: "Full-stack cloud platform for modern apps",
      pricing: "Free tier available, $7/month starter",
      features: ["Auto-deploy from Git", "Custom domains", "SSL certificates", "Database hosting"],
      status: "connected",
    },
    {
      id: "railway",
      name: "Railway",
      icon: "🚂",
      description: "Deploy from GitHub with zero configuration",
      pricing: "$5/month hobby, usage-based pricing",
      features: ["One-click deploy", "Database hosting", "Custom domains", "Team collaboration"],
      status: "disconnected",
    },
    {
      id: "fly",
      name: "Fly.io",
      icon: "🪰",
      description: "Deploy apps close to your users globally",
      pricing: "Pay-as-you-go, $1.94/month minimum",
      features: ["Global deployment", "Auto-scaling", "Custom domains", "Database hosting"],
      status: "disconnected",
    },
  ]

  useEffect(() => {
    loadRepositories()
    loadDeployments()
  }, [])

  const loadRepositories = async () => {
    try {
      const savedToken = localStorage.getItem("github_token")
      if (!savedToken) {
        toast({
          title: "GitHub Not Connected",
          description: "Please connect your GitHub account first",
          variant: "destructive",
        })
        return
      }

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
      toast({
        title: "Error",
        description: "Failed to load repositories. Please check your GitHub connection.",
        variant: "destructive",
      })
    }
  }

  const loadDeployments = () => {
    try {
      const saved = localStorage.getItem("deployments")
      if (saved) {
        const deployments = JSON.parse(saved)
        setDeployments(deployments)
      }
    } catch (error) {
      console.error("Failed to load deployments:", error)
    }
  }

  const deployToVercel = async () => {
    if (!selectedRepo) {
      toast({
        title: "Error",
        description: "Please select a repository to deploy",
        variant: "destructive",
      })
      return
    }

    setIsDeploying(true)

    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repository: selectedRepo,
          platform: selectedPlatform || "vercel",
          github_token: localStorage.getItem("github_token"),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const newDeployment: DeploymentStatus = {
          id: result.deploymentId || `deploy_${Date.now()}`,
          repository: selectedRepo,
          platform: selectedPlatform || "vercel",
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        setDeployments((prev) => [newDeployment, ...prev])
        localStorage.setItem("deployments", JSON.stringify([newDeployment, ...deployments]))

        toast({
          title: "Deployment Started",
          description: `Deploying ${selectedRepo} to ${selectedPlatform || "Vercel"}`,
        })

        // Simulate deployment progress
        setTimeout(() => {
          setDeployments((prev) =>
            prev.map((d) =>
              d.id === newDeployment.id
                ? { ...d, status: "building" as const, updated_at: new Date().toISOString() }
                : d,
            ),
          )
        }, 2000)

        setTimeout(() => {
          const finalDeployment = {
            ...newDeployment,
            status: "deployed" as const,
            url: `https://${selectedRepo.split("/")[1]}.${selectedPlatform || "vercel"}.app`,
            updated_at: new Date().toISOString(),
            cost: Math.random() * 10,
            metrics: {
              requests: Math.floor(Math.random() * 10000),
              uptime: 99.9,
              responseTime: Math.floor(Math.random() * 200) + 50,
            },
          }

          setDeployments((prev) => prev.map((d) => (d.id === newDeployment.id ? finalDeployment : d)))

          toast({
            title: "Deployment Complete",
            description: `${selectedRepo} is now live!`,
          })
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
      setIsDeploying(false)
    }
  }

  const refreshStatus = async () => {
    setIsRefreshing(true)

    try {
      const response = await fetch("/api/deployment-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deployments: deployments.map((d) => d.id) }),
      })

      if (response.ok) {
        const result = await response.json()
        // Update deployments with fresh status
        setDeployments((prev) =>
          prev.map((d) => {
            const updated = result.deployments?.find((u: any) => u.id === d.id)
            return updated ? { ...d, ...updated } : d
          }),
        )

        toast({
          title: "Status Updated",
          description: "Deployment status refreshed successfully",
        })
      }
    } catch (error) {
      console.error("Failed to refresh status:", error)
      toast({
        title: "Refresh Failed",
        description: "Could not refresh deployment status",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusIcon = (status: DeploymentStatus["status"]) => {
    switch (status) {
      case "deployed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "building":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: DeploymentStatus["status"]) => {
    switch (status) {
      case "deployed":
        return "bg-green-100 text-green-800"
      case "building":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getTrendIcon = (trend: DeploymentMetric["trend"]) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case "down":
        return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
      case "stable":
      default:
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />
    }
  }

  const totalCost = deployments.reduce((sum, d) => sum + (d.cost || 0), 0)
  const activeDeployments = deployments.filter((d) => d.status === "deployed").length
  const totalRequests = deployments.reduce((sum, d) => sum + (d.metrics?.requests || 0), 0)

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Deployments</p>
                <p className="text-3xl font-bold text-green-600">{activeDeployments}</p>
              </div>
              <Rocket className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
                <p className="text-3xl font-bold text-blue-600">${totalCost.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-purple-600">{totalRequests.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Uptime</p>
                <p className="text-3xl font-bold text-orange-600">99.9%</p>
              </div>
              <Globe className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="deploy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Deploy Repository
              </CardTitle>
              <CardDescription>Select a repository and platform to deploy your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deploy-repo">Repository</Label>
                  <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select repository..." />
                    </SelectTrigger>
                    <SelectContent>
                      {repositories.map((repo) => (
                        <SelectItem key={repo.id} value={repo.full_name}>
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4" />
                            <span>{repo.name}</span>
                            {repo.language && <Badge variant="outline">{repo.language}</Badge>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deploy-platform">Platform</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform..." />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms
                        .filter((p) => p.status === "connected")
                        .map((platform) => (
                          <SelectItem key={platform.id} value={platform.id}>
                            <div className="flex items-center gap-2">
                              <span>{platform.icon}</span>
                              <span>{platform.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={deployToVercel} disabled={isDeploying || !selectedRepo} className="flex-1">
                  <Rocket className="h-4 w-4 mr-2" />
                  {isDeploying ? "Deploying..." : "Deploy to Vercel"}
                </Button>
                <Button onClick={refreshStatus} disabled={isRefreshing} variant="outline">
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {metrics.map((metric, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{metric.name}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span
                        className={`text-xs ${
                          metric.trend === "up"
                            ? "text-green-600"
                            : metric.trend === "down"
                              ? "text-red-600"
                              : "text-gray-600"
                        }`}
                      >
                        {metric.change}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platforms.map((platform) => (
              <Card key={platform.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{platform.icon}</span>
                      <span>{platform.name}</span>
                    </div>
                    <Badge variant={platform.status === "connected" ? "default" : "secondary"}>{platform.status}</Badge>
                  </CardTitle>
                  <CardDescription>{platform.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Pricing</p>
                    <p className="text-sm">{platform.pricing}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Features</p>
                    <ul className="text-sm space-y-1">
                      {platform.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    variant={platform.status === "connected" ? "outline" : "default"}
                    className="w-full"
                    disabled={platform.status === "connected"}
                  >
                    {platform.status === "connected" ? "Connected" : "Connect"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment History</CardTitle>
              <CardDescription>Recent deployments and their status</CardDescription>
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
                          {deployment.platform} • {new Date(deployment.created_at).toLocaleString()}
                        </p>
                        {deployment.metrics && (
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>{deployment.metrics.requests.toLocaleString()} requests</span>
                            <span>{deployment.metrics.uptime}% uptime</span>
                            <span>{deployment.metrics.responseTime}ms avg</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(deployment.status)}>{deployment.status}</Badge>
                      {deployment.cost && <Badge variant="outline">${deployment.cost.toFixed(2)}/mo</Badge>}
                      {deployment.url && deployment.status === "deployed" && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {deployments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Rocket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>No deployments yet</p>
                    <p className="text-sm mt-2">Deploy a repository to see it here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Response Time</span>
                    <span className="font-medium">125ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-medium">99.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate</span>
                    <span className="font-medium">0.2%</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Health Score</span>
                      <span className="font-medium">98%</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Daily Active Users</span>
                    <span className="font-medium">1,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Page Views</span>
                    <span className="font-medium">45,678</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bounce Rate</span>
                    <span className="font-medium">23.4%</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">User Satisfaction</span>
                      <span className="font-medium">4.8/5</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
