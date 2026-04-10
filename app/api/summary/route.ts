import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { name, email, role, insights, tileId, tileTitle, keyInsight, takeaways } = await req.json()

  // Log for debugging (Google Sheets webhook can be wired via env var)
  console.log("[summary]", {
    timestamp: new Date().toISOString(),
    name,
    email,
    role,
    insights,
    tileId,
    tileTitle,
    keyInsight,
    takeaways,
  })

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheet: "Summaries",
          timestamp: new Date().toISOString(),
          name,
          email,
          role,
          tileId,
          tileTitle,
          keyInsight,
          insights: insights?.join(" | "),
          takeaways: takeaways?.join(" | "),
        }),
      })
    } catch {
      // Non-blocking — do not fail the request if webhook is unavailable
    }
  }

  return NextResponse.json({ ok: true })
}
