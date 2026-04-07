import { NextRequest, NextResponse } from "next/server"
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, company, revenue, tileId, tileTitle } = body
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
  }
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, company, revenue, tileId, tileTitle,
          timestamp: new Date().toISOString(),
          source: "saras-agent",
        }),
      })
    } catch (err) {
      console.error("Google Sheets webhook failed:", err)
    }
  }
  return NextResponse.json({ success: true })
}