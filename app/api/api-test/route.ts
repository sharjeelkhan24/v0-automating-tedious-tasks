import { type NextRequest, NextResponse } from "next/server"
import { AbortSignal } from "abort-controller"

export async function POST(req: NextRequest) {
  try {
    const { baseUrl, path, method = "GET", headers = {}, body } = await req.json()

    const defaultBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_APP_URL || ""
    const base = typeof baseUrl === "string" && baseUrl.length > 0 ? baseUrl : defaultBase

    if (!method || !path) {
      return NextResponse.json({ error: "Method and URL are required" }, { status: 400 })
    }

    const url = path?.startsWith("http") ? path : `${base.replace(/\/$/, "")}/${String(path || "").replace(/^\//, "")}`

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "MASE-API-Tester/1.0",
        ...(headers || {}),
      },
      body: method.toUpperCase() === "GET" ? undefined : body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    const responseData = {
      success: res.ok,
      statusCode: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries()),
      timestamp: new Date().toISOString(),
    }

    // Try to get response body
    try {
      const contentType = res.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        const body = await res.json()
        return NextResponse.json({
          ...responseData,
          body,
        })
      } else {
        const text = await res.text()
        return NextResponse.json({
          ...responseData,
          body: text.substring(0, 1000), // Limit response size
        })
      }
    } catch (bodyError) {
      return NextResponse.json({
        ...responseData,
        body: "Could not parse response body",
      })
    }
  } catch (err) {
    console.error("api-test error:", err)

    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({
        success: false,
        statusCode: 408,
        statusText: "Request Timeout",
        error: "Request timed out after 10 seconds",
      })
    }

    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        statusText: "Internal Server Error",
        error: err instanceof Error ? err.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
