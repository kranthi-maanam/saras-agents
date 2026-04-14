"use client"

import { PhaseBadge } from "@/components/ccc/PhaseBadge"
import type { CccInteraction } from "@/lib/cccWriter"

const TYPE_CONFIG: Record<string, { label: string; icon: string; accent: string }> = {
  lead_captured:     { label: "Lead Captured",       icon: "⚡", accent: "border-l-zinc-300 dark:border-l-zinc-600" },
  summary_generated: { label: "Summary",             icon: "📋", accent: "border-l-blue-300 dark:border-l-blue-700" },
  booking_requested: { label: "Booking",             icon: "📅", accent: "border-l-emerald-400 dark:border-l-emerald-600" },
  demo_shown:        { label: "Demo Shown",          icon: "🎯", accent: "border-l-violet-300 dark:border-l-violet-700" },
  cs_checkin:        { label: "CS Check-in",         icon: "🤝", accent: "border-l-blue-400 dark:border-l-blue-600" },
  support_ticket:    { label: "Support Ticket",      icon: "🎫", accent: "border-l-red-300 dark:border-l-red-700" },
  manual_note:       { label: "Note",                icon: "✏️", accent: "border-l-zinc-300 dark:border-l-zinc-600" },
  turn_completed:    { label: "Turn",                icon: "💬", accent: "border-l-zinc-200 dark:border-l-zinc-700" },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function getDropOffBadge(interaction: CccInteraction & { id: string; created_at: string }) {
  if (interaction.interaction_type === "booking_requested") {
    return { label: "Converted", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" }
  }
  const details = interaction.details as Record<string, unknown> | undefined
  const phase = details?.conversation_phase as string | undefined
  if (interaction.interaction_type === "summary_generated" && phase === "handoff") {
    return { label: "Completed", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" }
  }
  if (phase === "arrival" || phase === "topic_entry") {
    return { label: "Dropped early", color: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400" }
  }
  return null
}

interface InteractionCardProps {
  interaction: CccInteraction & { id: string; created_at: string }
  compact?: boolean
  onClick?: () => void
}

function CardInner({ interaction, compact, typeConfig, dropOff }: {
  interaction: CccInteraction & { id: string; created_at: string }
  compact: boolean
  typeConfig: { label: string; icon: string; accent: string }
  dropOff: { label: string; color: string } | null
}) {
  const details = interaction.details as Record<string, unknown> | undefined
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm leading-none" aria-hidden="true">{typeConfig.icon}</span>
          <span className="text-xs font-medium text-[var(--text-2)] truncate">{typeConfig.label}</span>
          {interaction.agent_id && (
            <span className="text-[10px] text-[var(--text-3)] hidden sm:inline truncate">
              · {interaction.actor_name ?? interaction.agent_id}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {dropOff && (
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${dropOff.color}`}>
              {dropOff.label}
            </span>
          )}
          {typeof details?.conversation_phase === "string" && (
            <PhaseBadge phase={details.conversation_phase as string} size="sm" />
          )}
          <span className="text-[10px] text-[var(--text-3)] whitespace-nowrap">
            {timeAgo(interaction.created_at)}
          </span>
        </div>
      </div>

      <p className={`mt-1 text-[var(--text-1)] leading-snug text-left ${compact ? "text-xs line-clamp-1" : "text-xs line-clamp-2"}`}>
        {interaction.summary}
      </p>

      {!compact && details && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {Array.isArray(details.topics) &&
            (details.topics as string[]).slice(0, 3).map((t) => (
              <span key={t} className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-[var(--openui-sunk)] text-[var(--text-2)]">
                {t}
              </span>
            ))}
          {typeof details.intent_score === "number" && (
            <span
              aria-label={`Intent score ${details.intent_score} out of 10`}
              className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-[var(--openui-highlight)] text-[var(--openui-text-brand)]"
            >
              intent {details.intent_score}/10
            </span>
          )}
          <span aria-hidden="true" className="inline-block px-1.5 py-0.5 rounded text-[10px] text-[var(--text-3)]">
            click to expand →
          </span>
        </div>
      )}
    </>
  )
}

export function InteractionCard({ interaction, compact = false, onClick }: InteractionCardProps) {
  const typeConfig = TYPE_CONFIG[interaction.interaction_type] ?? {
    label: interaction.interaction_type,
    icon: "·",
    accent: "border-l-zinc-200 dark:border-l-zinc-700",
  }
  const dropOff = getDropOffBadge(interaction)
  const baseClass = `border-l-2 pl-3 py-2 ${typeConfig.accent}`

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`View full detail for ${typeConfig.label}: ${interaction.summary?.substring(0, 80)}`}
        className={`${baseClass} w-full cursor-pointer hover:bg-[var(--openui-sunk)] rounded-r-lg transition-colors -ml-px pl-4 focus-visible:outline-2 focus-visible:outline-[var(--openui-interactive-accent-default)] focus-visible:outline-offset-2 focus-visible:rounded`}
      >
        <CardInner interaction={interaction} compact={compact} typeConfig={typeConfig} dropOff={dropOff} />
      </button>
    )
  }

  return (
    <div className={baseClass}>
      <CardInner interaction={interaction} compact={compact} typeConfig={typeConfig} dropOff={dropOff} />
    </div>
  )
}
