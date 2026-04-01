import { NextResponse } from "next/server"
import { config, validateConfig } from "@/lib/config"
import { serviceStatus } from "@/lib/env-validation"

export async function GET() {
  try {
    const configValidation = validateConfig()

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: config.env.nodeEnv,
      services: {
        backend: {
          configured: !!config.api.baseUrl,
          url: config.api.baseUrl,
        },
        github: {
          configured: serviceStatus.isGitHubConfigured(),
          webhookSecret: !!config.github.webhookSecret,
        },
        database: {
          configured: serviceStatus.isDatabaseConfigured(),
          hasUrl: !!config.database.url,
        },
        ai: {
          openai: serviceStatus.isOpenAIConfigured(),
          groq: serviceStatus.isGroqConfigured(),
          xai: serviceStatus.isXAIConfigured(),
        },
        storage: {
          vercelBlob: serviceStatus.isBlobStorageConfigured(),
        },
        auth: {
          stackAuth: serviceStatus.isStackAuthConfigured(),
          supabase: serviceStatus.isSupabaseConfigured(),
        },
        search: {
          upstash: serviceStatus.isUpstashConfigured(),
        },
      },
      config: {
        isValid: configValidation.isValid,
        missingVars: configValidation.missingVars,
      },
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
