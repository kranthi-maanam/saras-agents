import { NextRequest, NextResponse } from "next/server"
import { logActivity } from "@/lib/cccWriter"

export async function POST(req: NextRequest) {
  try {
    const {
      agentId, agentTitle, visitorName, company, visitorRole,
      conversationPhase, turnNumber, intentScore, demoComponent,
    } = await req.json()

    logActivity({
      agent_id: agentId ?? "unknown",
      agent_title: agentTitle ?? "Unknown Agent",
      visitor_name: visitorName,
      company,
      visitor_role: visitorRole,
      action_type: demoComponent ? "demo_shown" : "turn_completed",
      action_summary: demoComponent
        ? `${visitorName ?? "Visitor"} was shown ${demoComponent} in ${agentTitle ?? "agent"}`
        : `${visitorName ?? "Visitor"} in ${agentTitle ?? "agent"} — Phase: ${conversationPhase ?? "unknown"}, Turn ${turnNumber ?? "?"}`,
      conversation_phase: conversationPhase,
      turn_number: turnNumber,
      intent_score: intentScore,
      demo_component: demoComponent,
    }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
