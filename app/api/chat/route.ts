import Groq from "groq-sdk"
import { getSystemPrompt, getPhase } from "@/lib/systemPrompt"

// Module-level lazy singleton — avoids re-instantiation on every request
let _groq: Groq | null = null
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return _groq
}

export const maxDuration = 30

const MODELS = [
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "gemma2-9b-it",
]

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

  let stream
  const groq = getGroq()
  for (const model of MODELS) {
    try {
      stream = await groq.chat.completions.create({
        model,
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      })
      break
    } catch (err: unknown) {
      const status = (err as { status?: number }).status
      if (status === 429 && model !== MODELS[MODELS.length - 1]) {
        continue
      }
      throw err
    }
  }

  if (!stream) throw new Error("All models rate-limited")

  const encoder = new TextEncoder()

  // Stream tokens directly to the client as they arrive — no buffering
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content ?? ""
        if (token) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(token)}\n\n`))
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"))
      controller.close()
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
