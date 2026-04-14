"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

const SECTIONS = [
  {
    title: "What is CCC?",
    icon: "🧠",
    content: `Collective Customer Consciousness — a single living record per customer that aggregates every interaction: agent conversations, pain points, intent signals, demos shown, bookings, support tickets, and CS check-ins.

Before CCC, this knowledge lived in 6 different places (Sarath's HubSpot, Balaji's call notes, Chai's memory, product logs, support tickets, engineering logs). Now it's one place — always current, readable by everyone in under 60 seconds.`,
  },
  {
    title: "Role Views",
    icon: "👁️",
    content: `Each tab filters and sorts the customer list for a specific internal lens:

• All — CEO view. Full list, all signals, no filter.
• Marketing (Sarath) — Awareness-stage leads. Who came in, from which agent, how deep did they go?
• Pre-Sales (Balaji) — Warm prospects with intent ≥ 3 who haven't booked yet. These are Balaji's next conversations — agent already did the discovery.
• Sales (Balaji) — Customers who requested a booking or are in the sales stage. Conversion focus.
• CS (Chai) — Active and at-risk customers. Last login, open tickets, experience curve trending.
• Support — Customers with open tickets or support-stage interactions.
• Experience (PM/Design) — Sorted by most conversation depth. Shows pain points in the customer's own words, which demos resonated, where they dropped off in the agent.
• Delivery (Engineering) — Agent performance view. Session depth, phase completion, anomalies.`,
  },
  {
    title: "Intent Score",
    icon: "📊",
    content: `Scored 0–10 based on keywords and behaviour in the agent conversation:

• 0–2 Low — browsing, no clear pain expressed
• 3–5 Medium — pain articulated, evaluating options
• 6–7 High — asked about pricing or demo, multi-turn depth
• 8–10 Very high — booking intent, urgency mentioned

Hover over any intent score in the UI to see the explanation. The score updates each session — the "Highest Intent" shown is the peak across all sessions.`,
  },
  {
    title: "Customer Lifecycle Stages",
    icon: "🗺️",
    content: `The 9 stages from Krishna's Customer Lifecycle Map:

1. Awareness / Marketing — First touch, lead captured via agent
2. Discovery — Active agent conversation, pain explored
3. Sign-Up / MQL — Intent confirmed, email captured
4. Sales — In conversion conversation with Balaji
5. Onboarding — Live customer, being set up
6. Product Use — Using Pulse/Daton in production
7. Support — Active ticket or issue in flight
8. Customer Success — Ongoing relationship with Chai
9. Renewal — Approaching contract renewal

Click any interaction card to see exactly which stage it happened at and whether the customer converted or dropped off.`,
  },
  {
    title: "Interaction Timeline",
    icon: "📋",
    content: `Every customer page shows a full interaction history. Click any card to open the detail drawer:

• Full conversation summary (untruncated)
• Lifecycle stage trail — shows which of the 9 stages this interaction happened at
• Conversation phase — Arrival → Topic Entry → Discovery → Handoff
• Conversion status — Converted, Dropped at Handoff, or Dropped Early
• Key quotes from the conversation
• Topics discussed and pain points in the customer's own words
• Demos shown during the session

Use the stage filter tabs (All / Marketing / Discovery / Sales…) to focus the timeline on one stage.`,
  },
  {
    title: "AI Analysis",
    icon: "✨",
    content: `Every customer detail page has an AI Analysis panel that auto-runs on load using the customer's full record + interaction history.

The analysis is role-scoped — the same customer looks different depending on your view:
• Balaji (Pre-Sales view) → "Here's the recommended opener and what the agent found"
• Chai (CS view) → "Retention risk, last active, experience curve signal"
• Sarath (Marketing view) → "Lead quality, acquisition signal, MQL assessment"

You can also type a custom question: "What's blocking conversion?" or "Is this customer at churn risk?" — the AI streams an answer in seconds using the full CCC context.`,
  },
  {
    title: "Live Feed",
    icon: "🔴",
    content: `The Live Feed (/ccc/live) shows real-time activity across all 8 agents — every turn, lead capture, booking, and demo shown.

Use it during demos to show prospects that the system is live and running, not a mockup. The homepage HomeTicker also shows a compact version.

When Supabase is connected, this updates in real time via Postgres Realtime subscription. In demo mode, it shows synthetic Meridian Retail / TechBrands / GlowLab data.`,
  },
  {
    title: "Demo Mode",
    icon: "🎭",
    content: `When Supabase env vars are not set, CCC falls back to demo data automatically — no errors, no empty states.

Demo customers:
• Sarah Chen (Meridian Retail) — CFO, intent 7, booked a call. 3 sessions, CM + Cohorts agent.
• Emma Liu (GlowLab) — CEO/Founder, intent 8, booked. Sales stage. Great for showing booking flow.
• Mike Torres (TechBrands) — COO, intent 4, discovery stage. Good for Pre-Sales view.
• Raj Patel (Pulse Retail) — VP Ecommerce, intent 5, inventory planning agent.
• Lisa Park (NovaCom) — CMO, intent 2, marketing stage.

Navigate to /ccc/customer/demo-meridian-001 for the richest detail page — full 5-interaction timeline.`,
  },
]

export function CCCHelpGuide() {
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const modal = open && mounted ? createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        className="fixed inset-x-4 top-12 bottom-8 z-[101] max-w-3xl mx-auto bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] shadow-2xl flex overflow-hidden"
      >
            {/* Sidebar */}
            <div className="w-48 shrink-0 border-r border-[var(--divider)] bg-[var(--openui-sunk)] py-4 flex flex-col">
              <div className="px-4 mb-3">
                <div id="guide-title" className="text-xs font-bold text-[var(--text-1)]">CCC Guide</div>
                <div className="text-[10px] text-[var(--text-3)]">Demo reference</div>
              </div>
              <nav className="flex-1 overflow-y-auto" aria-label="Guide sections">
                {SECTIONS.map((section, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSection(i)}
                    aria-current={activeSection === i ? "page" : undefined}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors ${
                      activeSection === i
                        ? "bg-[var(--openui-elevated)] text-[var(--text-1)] border-r-2 border-[var(--openui-interactive-accent-default)]"
                        : "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--openui-elevated)]/50"
                    }`}
                  >
                    <span className="text-base leading-none">{section.icon}</span>
                    <span className="text-[11px] font-medium leading-tight">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--divider)]">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{SECTIONS[activeSection].icon}</span>
                  <h2 className="text-sm font-bold text-[var(--text-1)]">{SECTIONS[activeSection].title}</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close guide"
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--openui-sunk)] text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors text-lg"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <p className="text-sm text-[var(--text-1)] leading-relaxed whitespace-pre-wrap">
                  {SECTIONS[activeSection].content}
                </p>
              </div>
              <div className="px-6 py-3 border-t border-[var(--divider)] flex justify-between items-center">
                <button
                  onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                  disabled={activeSection === 0}
                  className="text-xs text-[var(--text-2)] disabled:opacity-30 hover:text-[var(--text-1)] transition-colors"
                >
                  ← Previous
                </button>
                <span className="text-[10px] text-[var(--text-3)]">{activeSection + 1} / {SECTIONS.length}</span>
                <button
                  onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))}
                  disabled={activeSection === SECTIONS.length - 1}
                  className="text-xs text-[var(--text-2)] disabled:opacity-30 hover:text-[var(--text-1)] transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </>
    , document.body) : null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="CCC Help Guide"
        className="flex items-center gap-1 text-xs text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors px-2 py-1 rounded-md hover:bg-[var(--openui-sunk)]"
      >
        <span className="text-sm">?</span>
        <span className="hidden sm:inline">Guide</span>
      </button>
      {modal}
    </>
  )
}
