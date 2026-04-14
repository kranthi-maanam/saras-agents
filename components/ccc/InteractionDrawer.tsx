"use client"

import { useEffect, useRef } from "react"
import { PhaseBadge } from "@/components/ccc/PhaseBadge"
import type { CccInteraction } from "@/lib/cccWriter"

// 9-stage lifecycle from Krishna's Customer Lifecycle Map
const LIFECYCLE_STAGES = [
  { id: "marketing", label: "Awareness", short: "Mktg" },
  { id: "discovery", label: "Discovery", short: "Disc" },
  { id: "mql", label: "Sign-Up / MQL", short: "MQL" },
  { id: "sales", label: "Sales", short: "Sales" },
  { id: "onboarding", label: "Onboarding", short: "Onb" },
  { id: "product_use", label: "Product Use", short: "Prod" },
  { id: "support", label: "Support", short: "Supp" },
  { id: "cs", label: "Customer Success", short: "CS" },
  { id: "renewal", label: "Renewal", short: "Ren" },
]

const INTENT_TOOLTIP: Record<string, string> = {
  "0-2": "Low — browsing, no clear pain expressed yet",
  "3-5": "Medium — pain articulated, evaluating options",
  "6-7": "High — asked about pricing or demo, multi-turn depth",
  "8-10": "Very high — booking intent, urgency mentioned",
}

function getIntentTier(score: number): string {
  if (score <= 2) return "0-2"
  if (score <= 5) return "3-5"
  if (score <= 7) return "6-7"
  return "8-10"
}

const TYPE_CONFIG: Record<string, { label: string; icon: string }> = {
  lead_captured: { label: "Lead Captured", icon: "⚡" },
  summary_generated: { label: "Conversation Summary", icon: "📋" },
  booking_requested: { label: "Booking Requested", icon: "📅" },
  demo_shown: { label: "Demo Shown", icon: "🎯" },
  turn_completed: { label: "Turn Completed", icon: "💬" },
  manual_note: { label: "Manual Note", icon: "✏️" },
  cs_checkin: { label: "CS Check-in", icon: "🤝" },
  support_ticket: { label: "Support Ticket", icon: "🎫" },
}

function getConversionStatus(interaction: CccInteraction & { id: string; created_at: string }) {
  if (interaction.interaction_type === "booking_requested") {
    return { label: "Converted", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" }
  }
  const details = interaction.details as Record<string, unknown> | undefined
  const phase = details?.conversation_phase as string | undefined
  if (phase === "handoff") {
    return { label: "Completed — no booking", color: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" }
  }
  if (phase === "arrival" || phase === "topic_entry") {
    return { label: "Dropped early", color: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400" }
  }
  if (interaction.interaction_type === "lead_captured") {
    return { label: "Entry point", color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" }
  }
  return null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

interface InteractionDrawerProps {
  interaction: (CccInteraction & { id: string; created_at: string }) | null
  onClose: () => void
}

export function InteractionDrawer({ interaction, onClose }: InteractionDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  // Move focus to close button when drawer opens
  useEffect(() => {
    if (interaction) closeRef.current?.focus()
  }, [interaction])

  if (!interaction) return null

  const details = interaction.details as Record<string, unknown> | undefined
  const intentScore = typeof details?.intent_score === "number" ? details.intent_score : null
  const stageIndex = LIFECYCLE_STAGES.findIndex(s => s.id === interaction.lifecycle_stage)
  const typeConfig = TYPE_CONFIG[interaction.interaction_type] ?? { label: interaction.interaction_type, icon: "·" }
  const conversionStatus = getConversionStatus(interaction)
  const titleId = "drawer-title"

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed right-0 top-0 h-full z-50 w-full max-w-lg bg-[var(--card-bg)] border-l border-[var(--card-border)] shadow-2xl overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-[var(--divider)] bg-[var(--card-bg)]/95 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">{typeConfig.icon}</span>
            <div>
              <div id={titleId} className="text-sm font-semibold text-[var(--text-1)]">{typeConfig.label}</div>
              <div className="text-[11px] text-[var(--text-3)]">{formatDate(interaction.created_at)}</div>
            </div>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close detail drawer"
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--openui-sunk)] text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors text-lg leading-none"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="flex-1 px-5 py-4 space-y-5">
          {/* Conversion / drop-off status */}
          {conversionStatus && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${conversionStatus.color}`}>
              {conversionStatus.label}
            </span>
          )}

          {/* 9-stage lifecycle trail */}
          <div>
            <div className="text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-wide mb-2">
              Customer Lifecycle Stage
            </div>
            <div
              className="flex items-center gap-0"
              role="list"
              aria-label={`Lifecycle stage: ${LIFECYCLE_STAGES[stageIndex]?.label ?? "Unknown"}. Stage ${stageIndex + 1} of ${LIFECYCLE_STAGES.length}.`}
            >
              {LIFECYCLE_STAGES.map((stage, i) => {
                const isActive = i === stageIndex
                const isPast = i < stageIndex
                return (
                  <div key={stage.id} className="flex items-center" role="listitem">
                    <div
                      aria-current={isActive ? "step" : undefined}
                      aria-label={`${stage.label}${isActive ? " (current)" : isPast ? " (completed)" : " (upcoming)"}`}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? "bg-[var(--openui-interactive-accent-default)] text-white"
                          : isPast
                            ? "bg-[var(--openui-sunk)] text-[var(--text-2)]"
                            : "text-[var(--text-3)]"
                      }`}
                    >
                      {stage.short}
                    </div>
                    {i < LIFECYCLE_STAGES.length - 1 && (
                      <div
                        aria-hidden="true"
                        className={`w-3 h-px ${isPast || isActive ? "bg-[var(--openui-border-interactive)]" : "bg-[var(--divider)]"}`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Conversation phase */}
          {typeof details?.conversation_phase === "string" && (
            <div className="flex items-center gap-2">
              <div className="text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-wide">Conversation Phase</div>
              <PhaseBadge phase={details.conversation_phase} size="sm" />
            </div>
          )}

          {/* Intent score */}
          {intentScore !== null && (
            <div>
              <div className="text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-wide mb-1">Intent Score</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-[var(--text-1)] tabular-nums">
                  {intentScore}<span className="text-sm font-normal text-[var(--text-3)]">/10</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--openui-sunk)] text-[var(--text-2)]">
                  {intentScore <= 2 ? "Low" : intentScore <= 5 ? "Medium" : intentScore <= 7 ? "High" : "Very high"}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-2)] mt-1">{INTENT_TOOLTIP[getIntentTier(intentScore)]}</p>
            </div>
          )}

          {/* Summary */}
          <div>
            <div className="text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-wide mb-1">Summary</div>
            <p className="text-sm text-[var(--text-1)] leading-relaxed">{interaction.summary}</p>
          </div>

          {/* Key quotes */}
          {Array.isArray(details?.key_quotes) && (details.key_quotes as string[]).length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-wide mb-2">Key Quotes</div>
              <div className="space-y-2">
                {(details.key_quotes as string[]).map((q, i) => (
                  <blockquote key={i} className="border-l-2 border-[var(--openui-border-accent)] pl-3 text-xs italic text-[var(--text-2)]">
                    "{q}"
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {/* Topics */}
          {Array.isArray(details?.topics) && (details.topics as string[]).length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-wide mb-1.5">Topics Discussed</div>
              <div className="flex flex-wrap gap-1.5" role="list">
                {(details.topics as string[]).map((t, i) => (
                  <span key={i} role="listitem" className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--openui-sunk)] text-[var(--text-2)]">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Pain points */}
          {Array.isArray(details?.pain_points) && (details.pain_points as string[]).length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-wide mb-1.5">Pain Points</div>
              <ul className="space-y-1.5">
                {(details.pain_points as string[]).map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span aria-hidden="true" className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-xs text-[var(--text-1)]">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Demo components */}
          {Array.isArray(details?.demo_components_shown) && (details.demo_components_shown as string[]).length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-wide mb-1.5">Demos Shown</div>
              <div className="flex flex-wrap gap-1.5" role="list">
                {(details.demo_components_shown as string[]).map((d, i) => (
                  <span key={i} role="listitem" className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--openui-highlight)] text-[var(--openui-text-brand)]">
                    {String(d).replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Turn count */}
          {typeof details?.turn_count === "number" && (
            <div className="text-[11px] text-[var(--text-3)]">
              Conversation depth: <span className="font-semibold text-[var(--text-2)]">{details.turn_count} turns</span>
            </div>
          )}

          {/* Actor */}
          <div className="pt-2 border-t border-[var(--divider)] text-[11px] text-[var(--text-3)]">
            Logged by <span className="font-medium text-[var(--text-2)]">{interaction.actor_name ?? interaction.actor_type ?? "system"}</span>
            {interaction.channel && <> · via <span className="font-medium text-[var(--text-2)]">{interaction.channel}</span></>}
          </div>
        </div>
      </div>
    </>
  )
}
