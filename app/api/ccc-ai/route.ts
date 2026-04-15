import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

let _anthropic: Anthropic | null = null
function getAnthropic(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 0 })
  return _anthropic
}

const MODEL = "claude-haiku-4-5"

const ROLE_PROMPTS: Record<string, string> = {
  all: "You are a senior business analyst reviewing a customer's full lifecycle for the CEO. Give a crisp executive summary — where is this customer in their journey, what are the key signals, and what is the single most important next action?",
  marketing: "You are reviewing a prospect for Sarath (Marketing lead). Focus on: acquisition source and quality, which agent resonated, how deep they went, MQL quality signals, and whether this lead is worth nurturing further.",
  "pre-sales": "You are reviewing a warm prospect for Balaji (Pre-Sales). The agent has already done the discovery. Focus on: what pain they articulated, their intent score, what they're evaluating, and the exact recommended opener for the first human conversation. Be direct and specific.",
  sales: "You are reviewing a sales opportunity for Balaji. Focus on: conversion likelihood, urgency signals, what the blocker might be, and the recommended close approach. The goal is to enter the call knowing everything, so zero time is spent on discovery.",
  cs: "You are reviewing a customer account for Chai (Customer Success). Focus on: relationship health, last active signals, any risk of churn, open issues, and the recommended outreach approach. Reference the experience curve — is this customer trending up or down?",
  support: "You are reviewing a customer with support context for the support team. Focus on: what the reported issue is, customer's prior sentiment and history, urgency level, and recommended resolution path. Flag if this is a billing or trust issue that needs senior escalation.",
  experience: "You are reviewing a customer for the Product and Design team. Focus on: what pain points they described in their own words, which demo components resonated, where they dropped off in the agent conversation, and what this signals about the product experience.",
  delivery: "You are reviewing agent conversation depth for the Engineering team. Focus on: conversation phase completion, turn depth, intent score trajectory, any anomalies in the interaction pattern, and what this suggests about agent performance.",
}

function buildCustomerContext(customer: Record<string, unknown>, interactions: Record<string, unknown>[]): string {
  return `
CUSTOMER RECORD:
Name: ${customer.name ?? "Unknown"}
Company: ${customer.company ?? "Unknown"}
Role: ${customer.role ?? "Unknown"}
Revenue Range: ${customer.revenue_range ?? "Unknown"}
Lifecycle Stage: ${customer.lifecycle_stage ?? "Unknown"}
Highest Intent Score: ${customer.highest_intent_score ?? 0}/10
Booking Requested: ${customer.booking_requested ? "Yes" : "No"}
Total Sessions: ${customer.total_sessions ?? 0}
Total Turns: ${customer.total_turns ?? 0}
Last Active: ${customer.last_interaction_at ?? "Unknown"}
Last Agent: ${customer.last_agent_title ?? "Unknown"}
Pain Points: ${Array.isArray(customer.pain_points) ? (customer.pain_points as string[]).join(", ") : "None captured"}
Topics Discussed: ${Array.isArray(customer.topics_discussed) ? (customer.topics_discussed as string[]).join(", ") : "None captured"}
Demo Components Shown: ${Array.isArray(customer.demo_components_shown) ? (customer.demo_components_shown as string[]).join(", ") : "None"}
Retention Risk: ${customer.retention_risk ?? "Unknown"}

INTERACTION HISTORY (${interactions.length} interactions):
${interactions
  .slice(0, 8)
  .map(
    (i, idx) =>
      `${idx + 1}. [${i.lifecycle_stage}] ${i.interaction_type} — ${i.summary}`
  )
  .join("\n")}
`.trim()
}

export async function POST(req: NextRequest) {
  try {
    const { customer, interactions = [], view = "all", question } = await req.json()

    const rolePrompt = ROLE_PROMPTS[view] ?? ROLE_PROMPTS.all
    const customerContext = buildCustomerContext(customer, interactions)
    const userQuestion = question
      ? `Answer this specific question about the customer: ${question}`
      : "Give me your analysis and recommended next action."

    const stream = getAnthropic().messages.stream({
      model: MODEL,
      max_tokens: 400,
      temperature: 0.4,
      system: `${rolePrompt}\n\nBe concise — 3-5 sentences max unless asked for more. No bullet spam. Speak like a sharp colleague who has read everything and knows what matters.`,
      messages: [
        { role: "user", content: `${customerContext}\n\n${userQuestion}` },
      ],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text
              if (text) controller.enqueue(encoder.encode(text))
            }
          }
        } catch (err) {
          console.error("[ccc-ai] stream error", err)
        } finally {
          controller.close()
        }
      },
    })

    return new NextResponse(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Accel-Buffering": "no" },
    })
  } catch (err) {
    console.error("[ccc-ai]", err)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
