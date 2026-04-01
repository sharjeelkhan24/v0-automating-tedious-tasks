/**
 * Application Configuration
 * Centralized configuration management for environment variables
 */

// Backend Configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "https://ai-on-screen.onrender.com",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    timeout: 30000, // 30 seconds
  },

  // GitHub Configuration
  github: {
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || "",
    apiUrl: "https://api.github.com",
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || "",
    postgresUrl: process.env.POSTGRES_URL || "",
    prismaUrl: process.env.POSTGRES_PRISMA_URL || "",
    nonPoolingUrl: process.env.POSTGRES_URL_NON_POOLING || "",
  },

  // AI Services Configuration
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY || "",
    },
    xai: {
      apiKey: process.env.XAI_API_KEY || "",
    },
  },

  // Storage Configuration
  storage: {
    vercelBlob: {
      token: process.env.BLOB_READ_WRITE_TOKEN || "",
    },
  },

  // Security Configuration
  security: {
    secretKey: process.env.SECRET_KEY || "fallback-secret-key-change-in-production",
    reactAppApiKey: process.env.REACT_APP_API_KEY || "",
  },

  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL || process.env.SUPABASE_SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY || "",
  },

  // Upstash Configuration
  upstash: {
    searchUrl: process.env.UPSTASH_SEARCH_REST_URL || "",
    searchToken: process.env.UPSTASH_SEARCH_REST_TOKEN || "",
    searchReadonlyToken: process.env.UPSTASH_SEARCH_REST_READONLY_TOKEN || "",
  },

  // Stack Auth Configuration
  stackAuth: {
    projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID || "",
    publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || "",
    secretServerKey: process.env.STACK_SECRET_SERVER_KEY || "",
  },

  // Environment
  env: {
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    nodeEnv: process.env.NODE_ENV || "development",
  },

  // Feature Flags
  features: {
    enableAnalytics: true,
    enableErrorReporting: true,
    enableDebugMode: process.env.NODE_ENV === "development",
  },
} as const

// Validation function to check required environment variables
export function validateConfig() {
  const requiredVars = ["NEXT_PUBLIC_BACKEND_URL"]

  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.warn("Missing environment variables:", missingVars)
    console.warn("Please check your .env.local file")
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
  }
}

// Helper functions for common configuration tasks
export const configHelpers = {
  // Get API URL with path
  getApiUrl: (path = "") => {
    const baseUrl = config.api.baseUrl.replace(/\/$/, "")
    const cleanPath = path.replace(/^\//, "")
    return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl
  },

  // Get GitHub API URL with path
  getGitHubApiUrl: (path = "") => {
    const baseUrl = config.github.apiUrl.replace(/\/$/, "")
    const cleanPath = path.replace(/^\//, "")
    return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl
  },

  // Check if feature is enabled
  isFeatureEnabled: (feature: keyof typeof config.features) => {
    return config.features[feature]
  },

  // Get database URL based on environment
  getDatabaseUrl: () => {
    if (config.env.isProduction) {
      return config.database.postgresUrl || config.database.url
    }
    return config.database.url
  },
}

// Export individual configurations for easier imports
export const apiConfig = config.api
export const githubConfig = config.github
export const databaseConfig = config.database
export const aiConfig = config.ai
export const storageConfig = config.storage
export const securityConfig = config.security
export const supabaseConfig = config.supabase
export const upstashConfig = config.upstash
export const stackAuthConfig = config.stackAuth
export const envConfig = config.env
export const featureConfig = config.features
