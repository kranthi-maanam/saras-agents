import type { CccRecord } from "@/lib/cccWriter"

const INTENT_COLOR = (score: number) => {
  if (score >= 7) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 4) return "text-amber-600 dark:text-amber-400"
  return "text-[var(--text-3)]"
}

const INTENT_BAR = (score: number) => {
  if (score >= 7) return "bg-emerald-500"
  if (score >= 4) return "bg-amber-500"
  return "bg-zinc-400"
}

const INTENT_TOOLTIP: Record<string, string> = {
  low:     "0–2 · Browsing — no clear pain expressed yet",
  medium:  "3–5 · Evaluating — pain articulated, considering options",
  high:    "6–7 · Interested — asked about pricing or demo, multi-turn",
  veryhigh:"8–10 · Ready — booking intent, urgency mentioned",
}

function getIntentLabel(score: number) {
  if (score >= 8) return "very high"
  if (score >= 6) return "high"
  if (score >= 3) return "medium"
  return "low"
}

const STAGE_LABEL: Record<string, string> = {
  marketing:   "Awareness / Marketing",
  discovery:   "Discovery",
  mql:         "Sign-Up / MQL",
  sales:       "Sales",
  onboarding:  "Onboarding",
  product_use: "Product Use",
  support:     "Support",
  cs:          "Customer Success",
  renewal:     "Renewal",
}

const RISK_CONFIG: Record<string, { label: string; dot: string; text: string }> = {
  low:      { label: "Low risk",      dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  medium:   { label: "Medium risk",   dot: "bg-amber-500",   text: "text-amber-600 dark:text-amber-400" },
  high:     { label: "High risk",     dot: "bg-orange-500",  text: "text-orange-600 dark:text-orange-400" },
  critical: { label: "Critical risk", dot: "bg-red-500",     text: "text-red-600 dark:text-red-400" },
}

interface SignalsSidebarProps {
  customer: CccRecord & { id: string; created_at: string }
}

export function SignalsSidebar({ customer }: SignalsSidebarProps) {
  const intent = customer.highest_intent_score ?? 0
  const intentLabel = getIntentLabel(intent)
  const intentKey = intentLabel.replace(" ", "") as keyof typeof INTENT_TOOLTIP
  const risk = customer.retention_risk ? RISK_CONFIG[customer.retention_risk] : null

  return (
    <div className="space-y-4">
      {/* Intent Score */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide">Intent Score</span>
          <span
            title={INTENT_TOOLTIP[intentKey] ?? `Intent ${intent}/10`}
            className={`text-2xl font-bold tabular-nums cursor-help ${INTENT_COLOR(intent)}`}
          >
            {intent}<span className="text-sm font-normal text-[var(--text-3)]">/10</span>
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--openui-sunk-deep)] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${INTENT_BAR(intent)}`}
            style={{ width: `${intent * 10}%` }}
          />
        </div>
        <p
          title={INTENT_TOOLTIP[intentKey]}
          className="text-[10px] text-[var(--text-3)] cursor-help"
        >
          {INTENT_TOOLTIP[intentKey] ?? `Intent ${intent}/10`}
        </p>
        {customer.booking_requested && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Booking requested</span>
          </div>
        )}
      </div>

      {/* Retention Risk */}
      {risk && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 space-y-1.5">
          <span className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide">Retention Risk</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${risk.dot}`} />
            <span className={`text-sm font-semibold ${risk.text}`}>{risk.label}</span>
          </div>
          {(customer.open_ticket_count ?? 0) > 0 && (
            <p className="text-[11px] text-[var(--text-3)]">{customer.open_ticket_count} open ticket{(customer.open_ticket_count ?? 0) > 1 ? "s" : ""}</p>
          )}
        </div>
      )}

      {/* Lifecycle Stage */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 space-y-2">
        <span className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide">Stage</span>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--openui-sunk)] text-[var(--text-1)]">
            {STAGE_LABEL[customer.lifecycle_stage ?? ""] ?? customer.lifecycle_stage ?? "Unknown"}
          </span>
        </div>
        {customer.last_agent_title && (
          <p className="text-xs text-[var(--text-3)]">Last: {customer.last_agent_title}</p>
        )}
      </div>

      {/* Engagement */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 space-y-2">
        <span className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide">Engagement</span>
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div>
            <div className="text-lg font-bold text-[var(--text-1)] tabular-nums">{customer.total_sessions ?? 0}</div>
            <div className="text-[10px] text-[var(--text-3)]">Sessions</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[var(--text-1)] tabular-nums">{customer.total_turns ?? 0}</div>
            <div className="text-[10px] text-[var(--text-3)]">Total turns</div>
          </div>
        </div>
      </div>

      {/* Pain Points */}
      {customer.pain_points && customer.pain_points.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 space-y-2">
          <span className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide">Pain Points</span>
          <ul className="space-y-1.5 mt-1">
            {customer.pain_points.map((p, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="mt-0.5 w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                <span className="text-xs text-[var(--text-1)]">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Topics */}
      {customer.topics_discussed && customer.topics_discussed.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 space-y-2">
          <span className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide">Topics</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {customer.topics_discussed.map((t, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--openui-sunk)] text-[var(--text-2)]">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Demos Shown */}
      {customer.demo_components_shown && customer.demo_components_shown.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 space-y-2">
          <span className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide">Demos Shown</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {customer.demo_components_shown.map((d, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--openui-highlight)] text-[var(--openui-text-brand)]">
                {d.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
