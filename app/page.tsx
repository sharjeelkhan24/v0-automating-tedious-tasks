"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  Brain,
  Code,
  Database,
  Rocket,
  Github,
  Monitor,
  Zap,
  Shield,
  Settings,
  Play,
  AlertTriangle,
  Eye,
  AppWindowIcon as Window,
  NotebookTabsIcon as Tab,
  Maximize2,
  CheckCircle,
} from "lucide-react"

import { CodingDashboard } from "@/components/coding-dashboard"
import { DeploymentDashboard } from "@/components/deployment-dashboard"
import { GitHubIntegration } from "@/components/github-integration"

interface ScreenTarget {
  id: string
  type: "window" | "tab" | "application"
  title: string
  url?: string
  application?: string
  isActive: boolean
}

interface TaskTemplate {
  id: string
  name: string
  description: string
  category: "form-filling" | "data-extraction" | "navigation" | "automation"
  template: string
  requiredFields: string[]
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview")
  const [task, setTask] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [selectedScreen, setSelectedScreen] = useState("")
  const [customFields, setCustomFields] = useState<Record<string, string>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [currentAction, setCurrentAction] = useState("")
  const [availableScreens, setAvailableScreens] = useState<ScreenTarget[]>([])
  const [isLoadingScreens, setIsLoadingScreens] = useState(false)
  const { toast } = useToast()

  const taskTemplates: TaskTemplate[] = [
    {
      id: "grant-application",
      name: "Grant Application Form",
      description: "Fill out grant application with organization details",
      category: "form-filling",
      template:
        "Fill out the grant application form with the following details:\n- Organization: {organization}\n- Contact Person: {contact}\n- Email: {email}\n- Project Title: {project}\n- Budget: {budget}",
      requiredFields: ["organization", "contact", "email", "project", "budget"],
    },
    {
      id: "insurance-enrollment",
      name: "Insurance Enrollment",
      description: "Complete insurance enrollment with patient information",
      category: "form-filling",
      template:
        "Complete the insurance enrollment form with:\n- Patient Name: {patientName}\n- DOB: {dob}\n- Insurance ID: {insuranceId}\n- Provider: {provider}",
      requiredFields: ["patientName", "dob", "insuranceId", "provider"],
    },
    {
      id: "data-extraction",
      name: "Extract Data from Page",
      description: "Extract specific data from the current webpage",
      category: "data-extraction",
      template: "Extract the following data from the current page:\n- {dataType1}\n- {dataType2}\n- {dataType3}",
      requiredFields: ["dataType1", "dataType2", "dataType3"],
    },
    {
      id: "form-automation",
      name: "Generic Form Automation",
      description: "Automate filling any form with custom data",
      category: "automation",
      template: "Automatically fill out the form on the current page with:\n{customInstructions}",
      requiredFields: ["customInstructions"],
    },
  ]

  // Load available screens/windows/tabs
  const loadAvailableScreens = async () => {
    setIsLoadingScreens(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://ai-on-screen.onrender.com"
      const response = await fetch(`${backendUrl}/api/screens/list`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        const screens = await response.json()
        setAvailableScreens(screens)
      } else {
        // Fallback to mock data if backend not available
        setAvailableScreens([
          {
            id: "current-tab",
            type: "tab",
            title: "MASE Platform - Current Tab",
            url: typeof window !== "undefined" ? window.location.href : "",
            isActive: true,
          },
          {
            id: "browser-window",
            type: "window",
            title: "Chrome Browser Window",
            application: "Google Chrome",
            isActive: true,
          },
          {
            id: "desktop",
            type: "window",
            title: "Full Desktop Screen",
            application: "Desktop",
            isActive: true,
          },
        ])
      }
    } catch (error) {
      console.error("Failed to load screens:", error)
      // Fallback screens
      setAvailableScreens([
        {
          id: "current-tab",
          type: "tab",
          title: "Current Browser Tab",
          url: typeof window !== "undefined" ? window.location.href : "",
          isActive: true,
        },
        {
          id: "new-tab",
          type: "tab",
          title: "New Browser Tab",
          isActive: false,
        },
        {
          id: "desktop",
          type: "window",
          title: "Desktop Screen",
          application: "Desktop",
          isActive: true,
        },
      ])
    } finally {
      setIsLoadingScreens(false)
    }
  }

  useEffect(() => {
    // Wrap in try-catch to prevent unhandled promise rejections
    const initializeScreens = async () => {
      try {
        await loadAvailableScreens()
      } catch (error) {
        console.error("Error initializing screens:", error)
        // Set fallback screens if initialization fails
        setAvailableScreens([
          {
            id: "current-tab",
            type: "tab",
            title: "Current Browser Tab",
            url: typeof window !== "undefined" ? window.location.href : "",
            isActive: true,
          },
        ])
      }
    }

    initializeScreens()

    // Add global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason)
      // Prevent the error from being logged to console as unhandled
      event.preventDefault()

      // Show user-friendly error message if it's a MetaMask or Web3 related error
      if (event.reason && typeof event.reason === "string" && event.reason.includes("MetaMask")) {
        console.warn("MetaMask connection error suppressed - not required for this application")
      }
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === "custom") {
      setSelectedTemplate("")
      setTask("")
      setCustomFields({})
      return
    }

    const template = taskTemplates.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setTask(template.template)
      // Initialize custom fields
      const fields: Record<string, string> = {}
      template.requiredFields.forEach((field) => {
        fields[field] = ""
      })
      setCustomFields(fields)
    }
  }

  const generateTaskFromTemplate = () => {
    const template = taskTemplates.find((t) => t.id === selectedTemplate)
    if (!template) return task

    let generatedTask = template.template
    Object.entries(customFields).forEach(([key, value]) => {
      generatedTask = generatedTask.replace(`{${key}}`, value || `[${key}]`)
    })
    return generatedTask
  }

  const handleStartAutomation = async () => {
    const finalTask = selectedTemplate ? generateTaskFromTemplate() : task

    if (!finalTask.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task description or select a template",
        variant: "destructive",
      })
      return
    }

    if (!selectedScreen) {
      toast({
        title: "Error",
        description: "Please select a screen/window/tab to work on",
        variant: "destructive",
      })
      return
    }

    setIsRunning(true)
    setLogs([])
    setCurrentAction("Initializing screen capture...")

    try {
      // Determine the appropriate API endpoint
      const isCodingTask =
        finalTask.toLowerCase().includes("deployment") ||
        finalTask.toLowerCase().includes("error") ||
        finalTask.toLowerCase().includes("code") ||
        finalTask.toLowerCase().includes("git") ||
        finalTask.toLowerCase().includes("fastapi") ||
        finalTask.toLowerCase().includes("backend")

      const isDeploymentTask =
        finalTask.toLowerCase().includes("deploy") ||
        finalTask.toLowerCase().includes("render") ||
        finalTask.toLowerCase().includes("vercel") ||
        finalTask.toLowerCase().includes("railway") ||
        finalTask.toLowerCase().includes("fly.io") ||
        finalTask.toLowerCase().includes("heroku") ||
        finalTask.toLowerCase().includes("aws") ||
        finalTask.toLowerCase().includes("cicd") ||
        finalTask.toLowerCase().includes("pipeline")

      const apiEndpoint = isDeploymentTask
        ? "/api/deployment-assistant"
        : isCodingTask
          ? "/api/code-assistant"
          : "/api/computer-use"

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: finalTask,
          screenTarget: selectedScreen,
          templateData: selectedTemplate ? customFields : null,
        }),
      })

      if (!response.ok) throw new Error("Failed to start automation")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response stream")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n").filter((line) => line.trim())

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.action) setCurrentAction(data.action)
              if (data.log) setLogs((prev) => [...prev, data.log])
            } catch (e) {
              console.error("Failed to parse SSE data:", e)
            }
          }
        }
      }
    } catch (error) {
      console.error("Automation error:", error)
      setLogs((prev) => [...prev, `Error: ${error instanceof Error ? error.message : "Unknown error"}`])
      toast({
        title: "Automation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
      setCurrentAction("")
    }
  }

  const getScreenIcon = (type: ScreenTarget["type"]) => {
    switch (type) {
      case "tab":
        return <Tab className="h-4 w-4" />
      case "window":
        return <Window className="h-4 w-4" />
      case "application":
        return <Maximize2 className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const features = [
    {
      icon: Brain,
      title: "AI Screen Reading",
      description: "Advanced computer vision for screen content analysis",
      color: "text-blue-600",
    },
    {
      icon: Code,
      title: "Code Generation",
      description: "AI-powered backend development with FastAPI",
      color: "text-green-600",
    },
    {
      icon: Github,
      title: "GitHub Integration",
      description: "Automated commits, pushes, and repository management",
      color: "text-purple-600",
    },
    {
      icon: Database,
      title: "Database Management",
      description: "PostgreSQL with Supabase real-time features",
      color: "text-orange-600",
    },
    {
      icon: Rocket,
      title: "Auto Deployment",
      description: "Deploy to Render.com and Vercel automatically",
      color: "text-red-600",
    },
    {
      icon: Monitor,
      title: "Performance Monitoring",
      description: "Real-time analytics and performance tracking",
      color: "text-indigo-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MASE Platform
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            AI-Powered Development Assistant with Screen Reading, Code Generation, GitHub Integration, and
            Auto-Deployment
          </p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              System Online
            </Badge>
            <Badge variant="outline">v2.0.0</Badge>
            <Badge variant="outline">Production Ready</Badge>
          </div>
        </div>

        {/* Task Configuration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Task Configuration
              </CardTitle>
              <CardDescription>Configure your automation task with templates or custom instructions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Screen/Window Selection */}
              <div className="space-y-2">
                <Label htmlFor="screen-select">Select Screen/Window/Tab to Work On</Label>
                <Select value={selectedScreen} onValueChange={setSelectedScreen}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose which screen to automate on..." />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingScreens ? (
                      <SelectItem value="loading" disabled>
                        Loading available screens...
                      </SelectItem>
                    ) : (
                      availableScreens.map((screen) => (
                        <SelectItem key={screen.id} value={screen.id}>
                          <div className="flex items-center gap-2">
                            {getScreenIcon(screen.type)}
                            <span>{screen.title}</span>
                            {screen.url && <span className="text-xs text-gray-500">({screen.url})</span>}
                            {screen.isActive && (
                              <Badge variant="outline" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={loadAvailableScreens} disabled={isLoadingScreens}>
                  <Eye className="h-4 w-4 mr-2" />
                  {isLoadingScreens ? "Scanning..." : "Refresh Screens"}
                </Button>
              </div>

              {/* Template Selection */}
              <div className="space-y-2">
                <Label htmlFor="template-select">Task Template (Optional)</Label>
                <Select value={selectedTemplate || "custom"} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template or create custom task..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Task (No Template)</SelectItem>
                    {taskTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-gray-500">{template.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Template Fields */}
              {selectedTemplate && (
                <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                  <Label className="text-sm font-medium">Template Fields</Label>
                  {taskTemplates
                    .find((t) => t.id === selectedTemplate)
                    ?.requiredFields.map((field) => (
                      <div key={field} className="space-y-1">
                        <Label htmlFor={field} className="text-xs capitalize">
                          {field.replace(/([A-Z])/g, " $1").trim()}
                        </Label>
                        <Input
                          id={field}
                          placeholder={`Enter ${field}...`}
                          value={customFields[field] || ""}
                          onChange={(e) =>
                            setCustomFields((prev) => ({
                              ...prev,
                              [field]: e.target.value,
                            }))
                          }
                          size="sm"
                        />
                      </div>
                    ))}
                </div>
              )}

              {/* Task Description */}
              <div className="space-y-2">
                <Label htmlFor="task">Task Description</Label>
                <Textarea
                  id="task"
                  placeholder={
                    selectedTemplate
                      ? "Task will be generated from template above..."
                      : "e.g., Fill out the grant application form with our organization details..."
                  }
                  value={selectedTemplate ? generateTaskFromTemplate() : task}
                  onChange={(e) => !selectedTemplate && setTask(e.target.value)}
                  rows={4}
                  disabled={!!selectedTemplate}
                />
              </div>

              <Button
                onClick={handleStartAutomation}
                disabled={isRunning || (!task.trim() && !selectedTemplate) || !selectedScreen}
                className="w-full"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                {isRunning ? "Running Automation..." : "Start AI Assistant"}
              </Button>
            </CardContent>
          </Card>

          {/* Status Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardDescription>Current automation status and target information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Screen Info */}
              {selectedScreen && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Target Selected</span>
                  </div>
                  {availableScreens.find((s) => s.id === selectedScreen) && (
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        {getScreenIcon(availableScreens.find((s) => s.id === selectedScreen)!.type)}
                        <span>{availableScreens.find((s) => s.id === selectedScreen)!.title}</span>
                      </div>
                      {availableScreens.find((s) => s.id === selectedScreen)!.url && (
                        <div className="text-xs text-gray-500 mt-1">
                          {availableScreens.find((s) => s.id === selectedScreen)!.url}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* System Capabilities */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">Screen Reading</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">Text Input</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">Mouse Control</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">Form Detection</span>
                </div>
              </div>

              {currentAction && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Current Action:</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{currentAction}</p>
                </div>
              )}

              {!isRunning && logs.length === 0 && (
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {!selectedScreen ? "Select a screen/window to get started" : "Ready to start automation"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Log */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>Real-time log of AI actions and screen interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No activity yet. Start an automation task to see logs here.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-50`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="coding" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Coding
            </TabsTrigger>
            <TabsTrigger value="github" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </TabsTrigger>
            <TabsTrigger value="deployment" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Deploy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Projects</p>
                      <p className="text-3xl font-bold text-blue-600">12</p>
                    </div>
                    <Code className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">GitHub Repos</p>
                      <p className="text-3xl font-bold text-green-600">8</p>
                    </div>
                    <Github className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Deployments</p>
                      <p className="text-3xl font-bold text-purple-600">24</p>
                    </div>
                    <Rocket className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Uptime</p>
                      <p className="text-3xl font-bold text-orange-600">99.9%</p>
                    </div>
                    <Shield className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Ready to Build Something Amazing?</h3>
                    <p className="text-blue-100 mb-4">
                      Use MASE to go from concept to production in minutes with AI-powered development tools.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        size="lg"
                        className="bg-white text-blue-600 hover:bg-gray-100"
                        onClick={() => setActiveTab("coding")}
                      >
                        <Code className="h-5 w-5 mr-2" />
                        Start Coding
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                        onClick={() => setActiveTab("github")}
                      >
                        <Github className="h-5 w-5 mr-2" />
                        Connect GitHub
                      </Button>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <Zap className="h-24 w-24 text-blue-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coding">
            <CodingDashboard />
          </TabsContent>

          <TabsContent value="github">
            <GitHubIntegration />
          </TabsContent>

          <TabsContent value="deployment">
            <DeploymentDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
