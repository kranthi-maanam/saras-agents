"use client"

import { useEffect, useRef, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { PhaseBadge } from "@/components/ccc/PhaseBadge"
import type { ActivityLogEntry } from "@/lib/cccWriter"
import { DEMO_ACTIVITY_FEED } from "@/lib/cccDemoData"

type ActivityEntry = ActivityLogEntry & { id: string; created_at: string }

const ACTION_ICON: Record<string, string> = {
  lead_captured: "⚡",
  summary_generated: "📋",
  booking_requested: "📅",
  demo_shown: "🎯",
  turn_completed: "💬",
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

interface LiveActivityPanelProps {
  compact?: boolean
  initialEntries?: ActivityEntry[]
  demo?: boolean
}

export function LiveActivityPanel({ compact = false, initialEntries = [], demo = false }: LiveActivityPanelProps) {
  const [entries, setEntries] = useState<ActivityEntry[]>(
    demo ? (DEMO_ACTIVITY_FEED as ActivityEntry[]) : initialEntries
  )
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (demo) return
    const sb = getSupabaseClient()
    if (!sb) return

    const channel = sb
      .channel("agent_activity_log")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "agent_activity_log" },
        (payload) => {
          const newEntry = payload.new as ActivityEntry
          setEntries((prev) => [newEntry, ...prev].slice(0, 50))
        }
      )
      .subscribe()

    return () => {
      sb.removeChannel(channel)
    }
  }, [demo])

  // Scroll to top on new entries
  useEffect(() => {
    if (scrollRef.current && !compact) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [entries.length, compact])

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[var(--text-3)]">
        <span className="text-2xl mb-2">📡</span>
        <p className="text-sm">Waiting for activity…</p>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className={compact ? "space-y-1" : "space-y-2 overflow-y-auto"}
      style={!compact ? { maxHeight: "calc(100vh - 200px)" } : undefined}
    >
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`flex items-start gap-2.5 rounded-lg transition-colors ${
            compact
              ? "py-1.5 px-2 hover:bg-[var(--openui-sunk)]"
              : "p-3 border border-[var(--divider)] bg-[var(--card-bg)] hover:border-[var(--card-hover-border)]"
          }`}
        >
          <span className={`shrink-0 ${compact ? "text-sm mt-0.5" : "text-base mt-0.5"}`}>
            {ACTION_ICON[entry.action_type] ?? "·"}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-[var(--text-1)] leading-snug ${compact ? "text-[11px] line-clamp-1" : "text-xs line-clamp-2"}`}>
                {entry.action_summary}
              </p>
              <span className="text-[10px] text-[var(--text-3)] whitespace-nowrap shrink-0">
                {timeAgo(entry.created_at)}
              </span>
            </div>

            {!compact && (
              <div className="flex items-center gap-1.5 mt-1">
                {entry.conversation_phase && (
                  <PhaseBadge phase={entry.conversation_phase} size="sm" />
                )}
                {entry.intent_score !== undefined && entry.intent_score > 0 && (
                  <span className="text-[10px] text-[var(--openui-text-brand)] bg-[var(--openui-highlight)] px-1.5 py-0.5 rounded">
                    intent {entry.intent_score}
                  </span>
                )}
                {entry.agent_title && (
                  <span className="text-[10px] text-[var(--text-3)]">{entry.agent_title}</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
