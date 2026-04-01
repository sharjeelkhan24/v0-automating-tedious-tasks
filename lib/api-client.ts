/**
 * API Client Configuration
 * Centralized HTTP client with proper error handling and configuration
 */

import { config, configHelpers } from "./config"

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode?: number
}

export interface ApiError {
  message: string
  statusCode: number
  details?: any
}

// HTTP Client class
export class ApiClient {
  private baseUrl: string
  private timeout: number
  private defaultHeaders: Record<string, string>

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.api.baseUrl
    this.timeout = config.api.timeout
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
  }

  // Generic request method
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = configHelpers.getApiUrl(endpoint)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const contentType = response.headers.get("content-type")
      let data: any

      if (contentType?.includes("application/json")) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}`,
          statusCode: response.status,
        }
      }

      return {
        success: true,
        data,
        statusCode: response.status,
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            error: "Request timeout",
            statusCode: 408,
          }
        }

        return {
          success: false,
          error: error.message,
          statusCode: 500,
        }
      }

      return {
        success: false,
        error: "Unknown error occurred",
        statusCode: 500,
      }
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "GET",
      headers,
    })
  }

  async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      headers,
    })
  }

  // Specialized methods for common tasks
  async testEndpoint(method: string, path: string, baseUrl?: string): Promise<ApiResponse> {
    const testUrl = baseUrl ? `${baseUrl}${path}` : configHelpers.getApiUrl(path)

    try {
      const response = await fetch(testUrl, {
        method: method.toUpperCase(),
        headers: this.defaultHeaders,
        signal: AbortSignal.timeout(10000), // 10 second timeout for tests
      })

      const responseData = {
        success: response.ok,
        statusCode: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: new Date().toISOString(),
      }

      // Try to get response body
      try {
        const contentType = response.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          const body = await response.json()
          return { ...responseData, data: body }
        } else {
          const text = await response.text()
          return { ...responseData, data: text.substring(0, 1000) }
        }
      } catch {
        return { ...responseData, data: "Could not parse response body" }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          statusCode: 408,
          statusText: "Request Timeout",
          error: "Request timed out after 10 seconds",
        }
      }

      return {
        success: false,
        statusCode: 500,
        statusText: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }
}

// Default API client instance
export const apiClient = new ApiClient()

// GitHub API client
export const githubApiClient = new ApiClient("https://api.github.com")

// Helper functions for common API operations
export const apiHelpers = {
  // Create authorization header for GitHub
  createGitHubAuthHeader: (token: string) => ({
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json",
  }),

  // Create authorization header for Bearer token
  createBearerAuthHeader: (token: string) => ({
    Authorization: `Bearer ${token}`,
  }),

  // Handle API errors consistently
  handleApiError: (error: ApiResponse): string => {
    if (error.error) {
      return error.error
    }

    if (error.statusCode) {
      switch (error.statusCode) {
        case 400:
          return "Bad request. Please check your input."
        case 401:
          return "Unauthorized. Please check your credentials."
        case 403:
          return "Forbidden. You do not have permission to perform this action."
        case 404:
          return "Resource not found."
        case 408:
          return "Request timeout. Please try again."
        case 429:
          return "Too many requests. Please wait and try again."
        case 500:
          return "Internal server error. Please try again later."
        default:
          return `Request failed with status ${error.statusCode}`
      }
    }

    return "An unknown error occurred"
  },
}
