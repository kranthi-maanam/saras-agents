import Anthropic from "@anthropic-ai/sdk"
import { getSystemPrompt, getPhase } from "@/lib/systemPrompt"

// Module-level lazy singleton — avoids re-instantiation on every request
let _anthropic: Anthropic | null = null
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 0 })
  return _anthropic
}

export const maxDuration = 30

const MODEL = "claude-haiku-4-5"

type ChatMessage = { role: "user" | "assistant"; content: string }

export async function POST(req: Request) {
  const { messages, tileId, tileTitle, visitorName, visitorRole } = await req.json()

  const userMessages = (messages as { role: string }[]).filter((m) => m.role === "user")
  const turnNumber = userMessages.length
  const phase = getPhase(turnNumber)

  const systemPrompt = getSystemPrompt(
    tileId ?? "saras-agent",
    tileTitle ?? "Saras Agent",
    visitorName,
    visitorRole,
    turnNumber,
    phase
  )

  // Anthropic requires the system prompt as a top-level param and only
  // user/assistant roles in messages.
  const conversation = (messages as ChatMessage[]).filter(
    (m) => m.role === "user" || m.role === "assistant"
  )

  const stream = getAnthropic().messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: conversation,
  })

  const encoder = new TextEncoder()

  // Stream tokens directly to the client as they arrive — keep the existing
  // SSE protocol the ChatUI expects: `data: ${JSON.stringify(token)}\n\n`.
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const token = event.delta.text
            if (token) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(token)}\n\n`))
            }
          }
        }
      } catch (err) {
        console.error("[chat] stream error", err)
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // disables Vercel/nginx proxy buffering for SSE
    },
  })
}
