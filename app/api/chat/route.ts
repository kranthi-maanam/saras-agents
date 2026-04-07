import Groq from "groq-sdk"
import { getSystemPrompt } from "@/lib/systemPrompt"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const { messages, tileId, tileTitle } = await req.json()

  const systemPrompt = getSystemPrompt(tileId ?? "saras-agent", tileTitle ?? "Saras Agent")

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
      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content ?? ""
        if (token) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(token)}\n\n`)
          )
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
      Connection: "keep-alive",
    },
  })
}
