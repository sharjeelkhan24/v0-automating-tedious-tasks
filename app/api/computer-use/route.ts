import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const sendUpdate = (action: string, log: string) => {
        const data = JSON.stringify({ action, log })
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }

      // Simulate the automation process
      const runAutomation = async () => {
        try {
          const { task, screenTarget, templateData } = await request.json()

          sendUpdate("Initializing connection to target", `Connecting to target: ${screenTarget}`)
          await new Promise((resolve) => setTimeout(resolve, 1000))

          sendUpdate("Taking screenshot of selected target", "Capturing current screen state")
          await new Promise((resolve) => setTimeout(resolve, 1500))

          sendUpdate("Processing visual elements", "Identifying interactive components")
          await new Promise((resolve) => setTimeout(resolve, 2000))

          // Check for OpenAI API key
          if (!process.env.OPENAI_API_KEY && !process.env.XAI_API_KEY) {
            sendUpdate(
              "API Key Missing",
              "OpenAI API key is missing. Pass it using the 'apiKey' parameter or the OPENAI_API_KEY environment variable.",
            )
            controller.close()
            return
          }

          sendUpdate("Analyzing task requirements", "Understanding automation objectives")
          await new Promise((resolve) => setTimeout(resolve, 1000))

          if (templateData) {
            sendUpdate("Processing template data", "Applying template fields to automation")
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }

          sendUpdate("Executing automation steps", "Performing screen interactions")
          await new Promise((resolve) => setTimeout(resolve, 3000))

          sendUpdate("Automation completed", "Task executed successfully")
          controller.close()
        } catch (error) {
          sendUpdate("Error", `Automation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
          controller.close()
        }
      }

      runAutomation()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
