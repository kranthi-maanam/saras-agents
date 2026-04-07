import { NextRequest, NextResponse } from "next/server"
export async function POST(req: NextRequest) {
  const { name, email, tileId, tileTitle, keyInsight, takeaways } = await req.json()
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheet: "Summaries",
          timestamp: new Date().toISOString(),
          name, email, tileId, tileTitle, keyInsight,
          takeaways: takeaways?.join(" | "),
        }),
      })
    } catch {
      // Non-blocking
    }
  }
  return NextResponse.json({ ok: true })
}