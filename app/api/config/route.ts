import { NextResponse } from "next/server"
import { getEnvStatus, serviceStatus } from "@/lib/env-validation"
import { config } from "@/lib/config"

export async function GET() {
  try {
    const envStatus = getEnvStatus()

    const configInfo = {
      environment: config.env.nodeEnv,
      features: config.features,
      services: {
        github: serviceStatus.isGitHubConfigured(),
        database: serviceStatus.isDatabaseConfigured(),
        openai: serviceStatus.isOpenAIConfigured(),
        groq: serviceStatus.isGroqConfigured(),
        xai: serviceStatus.isXAIConfigured(),
        supabase: serviceStatus.isSupabaseConfigured(),
        upstash: serviceStatus.isUpstashConfigured(),
        stackAuth: serviceStatus.isStackAuthConfigured(),
        blobStorage: serviceStatus.isBlobStorageConfigured(),
      },
      validation: {
        isValid: envStatus.isValid,
        errors: envStatus.errors,
        warnings: envStatus.warnings,
        recommendations: envStatus.recommendations,
      },
      // Only expose non-sensitive config in development
      ...(config.env.isDevelopment && {
        urls: {
          backend: config.api.baseUrl,
          app: config.api.appUrl,
        },
      }),
    }

    return NextResponse.json(configInfo)
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to get configuration",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
