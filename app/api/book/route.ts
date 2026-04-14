import { NextRequest, NextResponse } from "next/server"
import { logBookingRequest } from "@/lib/cccWriter"
export async function POST(req: NextRequest) {
  const { name, email, role, slot, tileTitle } = await req.json()
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheet: "SalesBookings",
          timestamp: new Date().toISOString(),
          name: name ?? "",
          email,
          role: role ?? "",
          slot,
          tileTitle: tileTitle ?? "",
          source: "saras-agent",
        }),
      })
    } catch {
      // Non-blocking
    }
  }
  console.log(`[book] Sales meeting requested by ${name} (${email}) — ${slot} — topic: ${tileTitle}`)

  // CCC write (non-blocking)
  logBookingRequest({ name, email, role, slot, tileTitle }).catch(() => {})

  return NextResponse.json({ ok: true })
}