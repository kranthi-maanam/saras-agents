import { getSupabase } from "@/lib/supabase/server"

// ── Types ────────────────────────────────────────────────────────

export interface CccRecord {
  id?: string
  email: string
  name?: string
  company?: string
  role?: string
  revenue_range?: string
  lifecycle_stage?: string
  last_interaction_at?: string
  last_agent_id?: string
  last_agent_title?: string
  total_sessions?: number
  total_turns?: number
  highest_intent_score?: number
  booking_requested?: boolean
  demo_components_shown?: string[]
  primary_use_case?: string
  pain_points?: string[]
  topics_discussed?: string[]
  // Retention signals
  last_product_login_at?: string
  open_ticket_count?: number
  subscription_tier?: string
  retention_risk?: string // 'low' | 'medium' | 'high' | 'critical' | 'unknown'
}

export interface CccInteraction {
  id?: string
  created_at?: string
  customer_id: string
  lifecycle_stage: string
  interaction_type: string
  actor_type?: "agent" | "human" | "system"
  actor_name?: string
  agent_id?: string
  summary: string
  details?: Record<string, unknown>
  channel?: string
}

export interface ActivityLogEntry {
  id?: string
  created_at?: string
  agent_id: string
  agent_title: string
  visitor_name?: string
  company?: string
  visitor_role?: string
  customer_id?: string
  action_type: string
  action_summary: string
  conversation_phase?: string
  turn_number?: number
  intent_score?: number
  demo_component?: string
  metadata?: Record<string, unknown>
}

// ── Core Functions ───────────────────────────────────────────────

export async function upsertCustomer(record: {
  email: string
  name?: string
  company?: string
  role?: string
  revenue_range?: string
  lifecycle_stage?: string
  last_agent_id?: string
  last_agent_title?: string
}): Promise<string | null> {
  const sb = getSupabase()
  if (!sb) return null
  try {
    const { data, error } = await sb
      .from("ccc_records")
      .upsert(
        { ...record, last_interaction_at: new Date().toISOString() },
        { onConflict: "email" }
      )
      .select("id")
      .single()
    if (error) {
      console.error("[CCC] upsertCustomer:", error.message)
      return null
    }
    return data?.id ?? null
  } catch (err) {
    console.error("[CCC] upsertCustomer exception:", err)
    return null
  }
}

export async function writeInteraction(interaction: Omit<CccInteraction, "id" | "created_at">): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  try {
    const { error } = await sb.from("ccc_interactions").insert(interaction)
    if (error) console.error("[CCC] writeInteraction:", error.message)
  } catch (err) {
    console.error("[CCC] writeInteraction exception:", err)
  }
}

export async function logActivity(entry: Omit<ActivityLogEntry, "id" | "created_at">): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  try {
    const { error } = await sb.from("agent_activity_log").insert(entry)
    if (error) console.error("[CCC] logActivity:", error.message)
  } catch (err) {
    console.error("[CCC] logActivity exception:", err)
  }
}

export async function updateSignals(
  customerId: string,
  signals: Partial<Pick<CccRecord, "highest_intent_score" | "demo_components_shown" | "pain_points" | "topics_discussed" | "booking_requested" | "lifecycle_stage" | "total_turns">>
): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  try {
    const { error } = await sb
      .from("ccc_records")
      .update({ ...signals, last_interaction_at: new Date().toISOString() })
      .eq("id", customerId)
    if (error) console.error("[CCC] updateSignals:", error.message)
  } catch (err) {
    console.error("[CCC] updateSignals exception:", err)
  }
}

// ── Convenience Wrappers ─────────────────────────────────────────

export async function logLeadCapture(data: {
  name: string
  email: string
  company?: string
  revenue?: string
  tileId: string
  tileTitle: string
}): Promise<void> {
  const customerId = await upsertCustomer({
    email: data.email,
    name: data.name,
    company: data.company,
    revenue_range: data.revenue,
    last_agent_id: data.tileId,
    last_agent_title: data.tileTitle,
  })
  if (!customerId) return

  await Promise.all([
    writeInteraction({
      customer_id: customerId,
      lifecycle_stage: "marketing",
      interaction_type: "lead_captured",
      actor_type: "agent",
      actor_name: `${data.tileTitle} Agent`,
      agent_id: data.tileId,
      summary: `${data.name}${data.company ? ` from ${data.company}` : ""} entered the ${data.tileTitle} agent.`,
      details: { revenue_range: data.revenue, tile_id: data.tileId },
      channel: "website",
    }),
    logActivity({
      agent_id: data.tileId,
      agent_title: data.tileTitle,
      visitor_name: data.name,
      company: data.company,
      customer_id: customerId,
      action_type: "lead_captured",
      action_summary: `${data.name}${data.company ? ` from ${data.company}` : ""} entered ${data.tileTitle}`,
    }),
  ])
}

export async function logConversationSummary(data: {
  name?: string
  email?: string
  role?: string
  insights?: string[]
  tileId?: string
  tileTitle?: string
  keyInsight?: string
  takeaways?: string[]
}): Promise<void> {
  if (!data.email) return
  const customerId = await upsertCustomer({
    email: data.email,
    name: data.name,
    lifecycle_stage: "discovery",
    last_agent_id: data.tileId,
    last_agent_title: data.tileTitle,
  })
  if (!customerId) return

  const summaryText = data.keyInsight
    ? `Key insight: ${data.keyInsight}`
    : data.insights?.join(". ") ?? "Conversation summary generated."

  await Promise.all([
    writeInteraction({
      customer_id: customerId,
      lifecycle_stage: "discovery",
      interaction_type: "summary_generated",
      actor_type: "agent",
      actor_name: data.tileTitle ? `${data.tileTitle} Agent` : "Agent",
      agent_id: data.tileId,
      summary: summaryText,
      details: {
        insights: data.insights,
        key_insight: data.keyInsight,
        takeaways: data.takeaways,
        role: data.role,
      },
      channel: "website",
    }),
    logActivity({
      agent_id: data.tileId ?? "unknown",
      agent_title: data.tileTitle ?? "Unknown Agent",
      visitor_name: data.name,
      customer_id: customerId,
      action_type: "summary_generated",
      action_summary: `Conversation with ${data.name ?? "visitor"} summarized in ${data.tileTitle ?? "agent"}`,
    }),
    updateSignals(customerId, {
      pain_points: data.insights?.slice(0, 5),
      topics_discussed: data.takeaways?.slice(0, 5),
    }),
  ])
}

export async function logBookingRequest(data: {
  name?: string
  email?: string
  role?: string
  slot?: string
  tileTitle?: string
  tileId?: string
}): Promise<void> {
  if (!data.email) return
  const customerId = await upsertCustomer({
    email: data.email,
    name: data.name,
    lifecycle_stage: "sales",
    last_agent_id: data.tileId,
    last_agent_title: data.tileTitle,
  })
  if (!customerId) return

  await Promise.all([
    writeInteraction({
      customer_id: customerId,
      lifecycle_stage: "sales",
      interaction_type: "booking_requested",
      actor_type: "agent",
      actor_name: data.tileTitle ? `${data.tileTitle} Agent` : "Agent",
      agent_id: data.tileId,
      summary: `${data.name ?? "Visitor"} requested a sales call${data.slot ? ` (${data.slot})` : ""} via ${data.tileTitle ?? "agent"}.`,
      details: { slot: data.slot, role: data.role },
      channel: "website",
    }),
    logActivity({
      agent_id: data.tileId ?? "unknown",
      agent_title: data.tileTitle ?? "Unknown Agent",
      visitor_name: data.name,
      customer_id: customerId,
      action_type: "booking_requested",
      action_summary: `${data.name ?? "Visitor"} booked a call via ${data.tileTitle ?? "agent"}`,
    }),
    updateSignals(customerId, {
      booking_requested: true,
      lifecycle_stage: "sales",
    }),
  ])
}
