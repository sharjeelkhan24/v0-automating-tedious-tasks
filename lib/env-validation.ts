/**
 * Environment Variable Validation
 * Validates and provides type-safe access to environment variables
 */

import { z } from "zod"

// Define the schema for environment variables
const envSchema = z.object({
  // Required variables
  NEXT_PUBLIC_BACKEND_URL: z.string().url("NEXT_PUBLIC_BACKEND_URL must be a valid URL"),

  // Optional variables with defaults
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // GitHub
  GITHUB_WEBHOOK_SECRET: z.string().optional(),

  // Database
  DATABASE_URL: z.string().optional(),
  POSTGRES_URL: z.string().optional(),
  POSTGRES_PRISMA_URL: z.string().optional(),
  POSTGRES_URL_NON_POOLING: z.string().optional(),

  // AI Services
  OPENAI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),

  // Storage
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  // Security
  SECRET_KEY: z.string().optional(),
  REACT_APP_API_KEY: z.string().optional(),

  // Supabase
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Alternative Supabase naming
  SUPABASE_SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Upstash
  UPSTASH_SEARCH_REST_URL: z.string().url().optional(),
  UPSTASH_SEARCH_REST_TOKEN: z.string().optional(),
  UPSTASH_SEARCH_REST_READONLY_TOKEN: z.string().optional(),

  // Stack Auth
  NEXT_PUBLIC_STACK_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: z.string().optional(),
  STACK_SECRET_SERVER_KEY: z.string().optional(),
})

// Validate environment variables
export function validateEnv() {
  try {
    const env = envSchema.parse(process.env)
    return {
      success: true,
      data: env,
      errors: [],
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }))

      return {
        success: false,
        data: null,
        errors,
      }
    }

    return {
      success: false,
      data: null,
      errors: [{ field: "unknown", message: "Unknown validation error" }],
    }
  }
}

// Get validated environment variables
export function getValidatedEnv() {
  const result = validateEnv()

  if (!result.success) {
    console.error("Environment validation failed:")
    result.errors.forEach((error) => {
      console.error(`  ${error.field}: ${error.message}`)
    })

    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment configuration")
    }
  }

  return result.data
}

// Type for validated environment
export type ValidatedEnv = z.infer<typeof envSchema>

// Environment status check
export function getEnvStatus() {
  const validation = validateEnv()

  const status = {
    isValid: validation.success,
    errors: validation.errors,
    warnings: [] as string[],
    recommendations: [] as string[],
  }

  // Check for common issues and provide recommendations
  if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
    status.warnings.push("NEXT_PUBLIC_BACKEND_URL is not set")
    status.recommendations.push("Set NEXT_PUBLIC_BACKEND_URL to your backend API URL")
  }

  if (!process.env.GITHUB_WEBHOOK_SECRET) {
    status.warnings.push("GITHUB_WEBHOOK_SECRET is not set")
    status.recommendations.push("Set GITHUB_WEBHOOK_SECRET for GitHub webhook security")
  }

  if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY && !process.env.XAI_API_KEY) {
    status.warnings.push("No AI service API keys are set")
    status.recommendations.push("Set at least one AI service API key (OPENAI_API_KEY, GROQ_API_KEY, or XAI_API_KEY)")
  }

  if (process.env.NODE_ENV === "production" && !process.env.SECRET_KEY) {
    status.warnings.push("SECRET_KEY is not set in production")
    status.recommendations.push("Set a strong SECRET_KEY for production security")
  }

  return status
}

// Helper to check if specific services are configured
export const serviceStatus = {
  isGitHubConfigured: () => !!process.env.GITHUB_WEBHOOK_SECRET,
  isDatabaseConfigured: () => !!(process.env.DATABASE_URL || process.env.POSTGRES_URL),
  isOpenAIConfigured: () => !!process.env.OPENAI_API_KEY,
  isGroqConfigured: () => !!process.env.GROQ_API_KEY,
  isXAIConfigured: () => !!process.env.XAI_API_KEY,
  isSupabaseConfigured: () => !!(process.env.SUPABASE_URL || process.env.SUPABASE_SUPABASE_URL),
  isUpstashConfigured: () => !!process.env.UPSTASH_SEARCH_REST_URL,
  isStackAuthConfigured: () => !!process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  isBlobStorageConfigured: () => !!process.env.BLOB_READ_WRITE_TOKEN,
}
