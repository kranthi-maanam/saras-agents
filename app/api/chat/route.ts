import Groq from "groq-sdk"
import { getSystemPrompt, getPhase } from "@/lib/systemPrompt"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const { messages, tileId, tileTitle, visitorName, visitorRole } = await req.json()

  // Determine turn number and phase from message history
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

  const stream = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    stream: true,
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      // Accumulate the full response first, then parse JSON
      let fullText = ""

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content ?? ""
        fullText += token
      }

      // Try to parse the response as JSON {message, component}
      let messageText = fullText
      let component: unknown = null

      try {
        // Strip potential markdown code fences if the model wraps in them
        const stripped = fullText.trim().replace(/^```json?\s*/i, "").replace(/\s*```$/, "").trim()
        const parsed = JSON.parse(stripped)
        if (parsed && typeof parsed.message === "string") {
          messageText = parsed.message
          component = parsed.component ?? null
        }
      } catch {
        // Not valid JSON — stream the raw text as-is (fallback)
        messageText = fullText
      }

      // Stream the message text token by token (word chunks for smooth UX)
      const words = messageText.split(/(\s+)/)
      for (const word of words) {
        if (word) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(word)}\n\n`)
          )
        }
      }

      // Emit component event if present
      if (component) {
        controller.enqueue(
          encoder.encode(`data: {"component":${JSON.stringify(component)}}\n\n`)
        )
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"))
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
