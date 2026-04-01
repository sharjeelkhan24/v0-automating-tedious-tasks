"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Database,
  GitBranch,
  Rocket,
  Shield,
  Activity,
  Globe,
  Server,
  Brain,
  Layers,
  CheckCircle,
  ArrowRight,
} from "lucide-react"

export default function MASEStackArchitecture() {
  const stackComponents = [
    {
      category: "Frontend",
      tool: "v0.dev",
      description: "AI-powered React/Next.js frontend generation",
      capabilities: ["Instant UI generation", "Component libraries", "Responsive design", "TypeScript support"],
      power: 95,
      speed: 98,
      color: "bg-blue-500",
    },
    {
      category: "Backend AI",
      tool: "Claude 3.5 Sonnet + GPT-4",
      description: "Advanced AI for backend development (more powerful than Codex)",
      capabilities: ["Complex API design", "Database schemas", "Business logic", "Error handling", "Security"],
      power: 98,
      speed: 92,
      color: "bg-purple-500",
    },
    {
      category: "Backend Framework",
      tool: "FastAPI + Python",
      description: "High-performance async API framework",
      capabilities: ["Auto documentation", "Type validation", "Async support", "High performance"],
      power: 90,
      speed: 95,
      color: "bg-green-500",
    },
    {
      category: "Database",
      tool: "PostgreSQL + Supabase",
      description: "Production-ready database with real-time features",
      capabilities: ["ACID compliance", "Real-time subscriptions", "Auth built-in", "Edge functions"],
      power: 92,
      speed: 88,
      color: "bg-emerald-500",
    },
    {
      category: "Deployment",
      tool: "Render.com",
      description: "Fast, reliable backend deployment",
      capabilities: ["Auto-deploy from Git", "SSL certificates", "Environment management", "Scaling"],
      power: 85,
      speed: 94,
      color: "bg-orange-500",
    },
    {
      category: "Frontend Deploy",
      tool: "Vercel",
      description: "Optimal for Next.js deployment",
      capabilities: ["Edge functions", "Global CDN", "Preview deployments", "Analytics"],
      power: 88,
      speed: 96,
      color: "bg-black",
    },
  ]

  const developmentFlow = [
    {
      step: 1,
      title: "Frontend Generation",
      description: "Use v0.dev to create React/Next.js components",
      tool: "v0.dev",
      time: "Minutes",
    },
    {
      step: 2,
      title: "Backend Development",
      description: "AI generates FastAPI backend with PostgreSQL",
      tool: "Claude 3.5 Sonnet",
      time: "Minutes",
    },
    {
      step: 3,
      title: "Database Setup",
      description: "Supabase PostgreSQL with real-time features",
      tool: "Supabase",
      time: "Seconds",
    },
    {
      step: 4,
      title: "Backend Deploy",
      description: "Deploy FastAPI to Render.com",
      tool: "Render.com",
      time: "2-3 minutes",
    },
    {
      step: 5,
      title: "Frontend Deploy",
      description: "Deploy Next.js to Vercel",
      tool: "Vercel",
      time: "30 seconds",
    },
    {
      step: 6,
      title: "Go Live",
      description: "MASE is live with custom domain",
      tool: "DNS + SSL",
      time: "Minutes",
    },
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          MASE Development Stack
        </h1>
        <p className="text-xl text-gray-600">
          The most powerful AI-driven development pipeline to get MASE live in minutes
        </p>
        <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500">
          Production Ready • Scalable • AI-Powered
        </Badge>
      </div>

      <Tabs defaultValue="architecture" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="architecture" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stackComponents.map((component, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${component.color}`} />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{component.category}</Badge>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-600">Live</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{component.tool}</CardTitle>
                  <CardDescription>{component.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Power</span>
                      <span>{component.power}%</span>
                    </div>
                    <Progress value={component.power} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Speed</span>
                      <span>{component.speed}%</span>
                    </div>
                    <Progress value={component.speed} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    {component.capabilities.map((capability, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{capability}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-600" />
                Why This Stack is Superior
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-purple-700">AI-First Development</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Claude 3.5 Sonnet &gt; Codex (more recent, more capable)</li>
                  <li>• v0.dev generates production-ready React components</li>
                  <li>• Automated testing and optimization</li>
                  <li>• Intelligent error handling and debugging</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-700">Production Excellence</h4>
                <ul className="space-y-1 text-sm">
                  <li>• FastAPI: Fastest Python framework (beats Flask/Django)</li>
                  <li>• PostgreSQL: Enterprise-grade reliability</li>
                  <li>• Render: Better than Heroku for modern apps</li>
                  <li>• Vercel: Optimal Next.js performance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <div className="space-y-4">
            {developmentFlow.map((flow, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {flow.step}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{flow.title}</h3>
                        <Badge variant="outline">{flow.tool}</Badge>
                        <Badge className="bg-green-100 text-green-700">{flow.time}</Badge>
                      </div>
                      <p className="text-gray-600">{flow.description}</p>
                    </div>
                    {index < developmentFlow.length - 1 && (
                      <ArrowRight className="h-6 w-6 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Rocket className="h-6 w-6" />
                Total Time to Live: ~10 Minutes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">3 min</div>
                  <div className="text-sm text-gray-600">Frontend + Backend Development</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">5 min</div>
                  <div className="text-sm text-gray-600">Deployment + Configuration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">2 min</div>
                  <div className="text-sm text-gray-600">DNS + SSL + Go Live</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-orange-500" />
                  Backend: Render.com
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Why Render for Backend?</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Faster than Heroku (modern infrastructure)</li>
                    <li>• Auto-deploy from Git commits</li>
                    <li>• Built-in PostgreSQL databases</li>
                    <li>• Free SSL certificates</li>
                    <li>• Environment variable management</li>
                    <li>• Automatic scaling</li>
                  </ul>
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600">Deploy FastAPI to Render</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Frontend: Vercel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Why Vercel for Frontend?</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Optimized for Next.js (same company)</li>
                    <li>• Global edge network</li>
                    <li>• Instant preview deployments</li>
                    <li>• Built-in analytics</li>
                    <li>• Serverless functions</li>
                    <li>• Custom domains</li>
                  </ul>
                </div>
                <Button className="w-full bg-black hover:bg-gray-800">Deploy Next.js to Vercel</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                Database: Supabase PostgreSQL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Features</h4>
                  <ul className="text-sm space-y-1">
                    <li>• PostgreSQL with real-time subscriptions</li>
                    <li>• Built-in authentication</li>
                    <li>• Row-level security</li>
                    <li>• Auto-generated APIs</li>
                    <li>• Edge functions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Integration</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Direct connection to Render backend</li>
                    <li>• Real-time updates to Vercel frontend</li>
                    <li>• Automatic backups</li>
                    <li>• Global distribution</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">API Response</span>
                    <span className="text-sm font-medium">{"<"} 100ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Frontend Load</span>
                    <span className="text-sm font-medium">{"<"} 1s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Database Query</span>
                    <span className="text-sm font-medium">{"<"} 50ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">SSL Certificates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">JWT Authentication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Row-level Security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">CORS Protection</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-500" />
                  Scalability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Auto-scaling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Load Balancing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">CDN Distribution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Database Scaling</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Launch MASE?</h2>
          <p className="text-lg mb-6 opacity-90">
            This stack will get MASE from concept to production in under 10 minutes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              <Rocket className="h-5 w-5 mr-2" />
              Start Development
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-purple-600 bg-transparent"
            >
              <GitBranch className="h-5 w-5 mr-2" />
              View Architecture
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
