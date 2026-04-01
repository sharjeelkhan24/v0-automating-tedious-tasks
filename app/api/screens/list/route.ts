import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Mock screen data - in a real implementation, this would interface with system APIs
    const mockScreens = [
      {
        id: "current-tab",
        type: "tab",
        title: "MASE Platform - Current Tab",
        url: "https://your-app.vercel.app",
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
      {
        id: "vscode",
        type: "application",
        title: "Visual Studio Code",
        application: "code",
        isActive: false,
      },
      {
        id: "terminal",
        type: "application",
        title: "Terminal",
        application: "terminal",
        isActive: false,
      },
    ]

    return NextResponse.json(mockScreens)
  } catch (error) {
    console.error("Failed to list screens:", error)
    return NextResponse.json({ error: "Failed to list available screens" }, { status: 500 })
  }
}
