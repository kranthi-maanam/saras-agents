"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { CccRecord } from "@/lib/cccWriter"
import type { ViewId } from "@/components/ccc/ViewTabs"

const INTENT_DOT = (score: number) => {
  if (score >= 7) return "bg-emerald-500"
  if (score >= 4) return "bg-amber-500"
  return "bg-zinc-400"
}

const STAGE_LABEL: Record<string, string> = {
  marketing: "Marketing",
  discovery: "Discovery",
  mql: "MQL",
  sales: "Sales",
  onboarding: "Onboarding",
  product_use: "Product",
  support: "Support",
  cs: "CS",
  renewal: "Renewal",
}

const RISK_CONFIG: Record<string, { label: string; color: string }> = {
  low:      { label: "Low risk",      color: "text-emerald-600 dark:text-emerald-400" },
  medium:   { label: "Medium risk",   color: "text-amber-600 dark:text-amber-400" },
  high:     { label: "High risk",     color: "text-orange-600 dark:text-orange-400" },
  critical: { label: "Critical risk", color: "text-red-600 dark:text-red-400" },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

type Customer = CccRecord & { id: string; created_at: string }

// ── Per-view filter + sort + stat logic ────────────────────────────

function applyViewFilter(customers: Customer[], view: ViewId): Customer[] {
  switch (view) {
    case "marketing":
      return customers.filter((c) => c.lifecycle_stage === "marketing")
    case "pre-sales":
      return customers.filter(
        (c) => c.lifecycle_stage === "discovery" && (c.highest_intent_score ?? 0) >= 3 && !c.booking_requested
      )
    case "sales":
      return customers
        .filter((c) => c.booking_requested || c.lifecycle_stage === "sales")
        .sort((a, b) => (b.highest_intent_score ?? 0) - (a.highest_intent_score ?? 0))
    case "cs":
      return customers
        .filter((c) => ["cs", "onboarding", "product_use", "renewal"].includes(c.lifecycle_stage ?? ""))
        .sort((a, b) => {
          const riskOrder = { critical: 0, high: 1, medium: 2, low: 3, unknown: 4 }
          return (riskOrder[a.retention_risk as keyof typeof riskOrder] ?? 4) -
                 (riskOrder[b.retention_risk as keyof typeof riskOrder] ?? 4)
        })
    case "support":
      return customers.filter(
        (c) => c.lifecycle_stage === "support" || (c.open_ticket_count ?? 0) > 0
      )
    case "experience":
      return [...customers].sort((a, b) => (b.total_turns ?? 0) - (a.total_turns ?? 0))
    case "delivery":
      return [...customers].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    default:
      return customers
  }
}

function getViewStats(customers: Customer[], view: ViewId) {
  const all = customers
  switch (view) {
    case "marketing":
      return [
        { label: "Total Leads", value: all.filter(c => c.lifecycle_stage === "marketing").length },
        { label: "Avg Turn Depth", value: all.length > 0 ? (all.reduce((s, c) => s + (c.total_turns ?? 0), 0) / all.length).toFixed(1) : "0" },
        { label: "High Quality (intent 5+)", value: all.filter(c => (c.highest_intent_score ?? 0) >= 5).length },
        { label: "Ready for Pre-Sales", value: all.filter(c => (c.highest_intent_score ?? 0) >= 3 && !c.booking_requested).length },
      ]
    case "pre-sales":
      return [
        { label: "Warm Prospects", value: all.filter(c => c.lifecycle_stage === "discovery" && (c.highest_intent_score ?? 0) >= 3 && !c.booking_requested).length },
        { label: "Hot (intent 6+)", value: all.filter(c => (c.highest_intent_score ?? 0) >= 6 && !c.booking_requested).length },
        { label: "Avg Intent", value: all.length > 0 ? (all.reduce((s, c) => s + (c.highest_intent_score ?? 0), 0) / all.length).toFixed(1) : "0" },
        { label: "Ready to Close", value: all.filter(c => (c.highest_intent_score ?? 0) >= 7).length },
      ]
    case "sales":
      return [
        { label: "Booked", value: all.filter(c => c.booking_requested).length },
        { label: "High Intent (7+)", value: all.filter(c => (c.highest_intent_score ?? 0) >= 7).length },
        { label: "In Sales Stage", value: all.filter(c => c.lifecycle_stage === "sales").length },
        { label: "Avg Intent", value: all.length > 0 ? (all.reduce((s, c) => s + (c.highest_intent_score ?? 0), 0) / all.length).toFixed(1) : "0" },
      ]
    case "cs":
      return [
        { label: "Active Accounts", value: all.filter(c => ["cs", "onboarding", "product_use"].includes(c.lifecycle_stage ?? "")).length },
        { label: "At Risk", value: all.filter(c => ["high", "critical"].includes(c.retention_risk ?? "")).length },
        { label: "Up for Renewal", value: all.filter(c => c.lifecycle_stage === "renewal").length },
        { label: "Avg Sessions", value: all.length > 0 ? (all.reduce((s, c) => s + (c.total_sessions ?? 0), 0) / all.length).toFixed(1) : "0" },
      ]
    case "support":
      return [
        { label: "Open Tickets", value: all.reduce((s, c) => s + (c.open_ticket_count ?? 0), 0) },
        { label: "In Support Stage", value: all.filter(c => c.lifecycle_stage === "support").length },
        { label: "Critical Risk", value: all.filter(c => c.retention_risk === "critical").length },
        { label: "Total Customers", value: all.length },
      ]
    case "experience":
      return [
        { label: "Total Turns", value: all.reduce((s, c) => s + (c.total_turns ?? 0), 0) },
        { label: "Deepest Sessions", value: all.filter(c => (c.total_turns ?? 0) >= 10).length },
        { label: "With Pain Points", value: all.filter(c => (c.pain_points?.length ?? 0) > 0).length },
        { label: "Demos Triggered", value: all.filter(c => (c.demo_components_shown?.length ?? 0) > 0).length },
      ]
    case "delivery":
      return [
        { label: "Total Sessions", value: all.reduce((s, c) => s + (c.total_sessions ?? 0), 0) },
        { label: "Avg Intent", value: all.length > 0 ? (all.reduce((s, c) => s + (c.highest_intent_score ?? 0), 0) / all.length).toFixed(1) : "0" },
        { label: "High Phase Depth", value: all.filter(c => (c.total_turns ?? 0) >= 7).length },
        { label: "Total Customers", value: all.length },
      ]
    default: // "all"
      return [
        { label: "Total", value: all.length },
        { label: "High Intent (7+)", value: all.filter(c => (c.highest_intent_score ?? 0) >= 7).length },
        { label: "Bookings", value: all.filter(c => c.booking_requested).length },
        { label: "Avg Intent", value: all.length > 0 ? (all.reduce((s, c) => s + (c.highest_intent_score ?? 0), 0) / all.length).toFixed(1) : "0" },
      ]
  }
}

interface CustomerListProps {
  customers: Customer[]
  activeView?: ViewId
}

export function CustomerList({ customers, activeView = "all" }: CustomerListProps) {
  const [search, setSearch] = useState("")

  const viewFiltered = useMemo(() => applyViewFilter(customers, activeView), [customers, activeView])
  const stats = useMemo(() => getViewStats(viewFiltered, activeView), [viewFiltered, activeView])

  const filtered = useMemo(() => {
    if (!search) return viewFiltered
    const q = search.toLowerCase()
    return viewFiltered.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q)
    )
  }, [viewFiltered, search])

  return (
    <div className="space-y-4">
      {/* View stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3">
            <div className="text-xl font-bold text-[var(--text-1)] tabular-nums">{stat.value}</div>
            <div className="text-[11px] text-[var(--text-3)] mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, email, or company…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--openui-border-interactive)]"
      />

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-[var(--text-3)] rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
          {search ? "No customers match your search." : "No customers in this view yet."}
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--card-border)] overflow-hidden bg-[var(--card-bg)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--divider)] bg-[var(--openui-sunk)]">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide hidden md:table-cell">Company</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide hidden sm:table-cell">Stage</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide">Intent</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide hidden lg:table-cell">
                  {activeView === "cs" || activeView === "support" ? "Risk" : "Last Agent"}
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide hidden sm:table-cell">Active</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--divider)]">
              {filtered.map((c) => {
                const risk = c.retention_risk ? RISK_CONFIG[c.retention_risk] : null
                return (
                  <tr key={c.id} className="hover:bg-[var(--openui-sunk)] transition-colors group">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--text-1)]">{c.name ?? c.email}</div>
                      <div className="text-[11px] text-[var(--text-3)]">{c.role ?? c.email}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-[var(--text-2)]">{c.company ?? "—"}</div>
                      {c.revenue_range && (
                        <div className="text-[11px] text-[var(--text-3)]">{c.revenue_range}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--openui-sunk)] text-[var(--text-2)]">
                        {STAGE_LABEL[c.lifecycle_stage ?? ""] ?? c.lifecycle_stage ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${INTENT_DOT(c.highest_intent_score ?? 0)}`} />
                        <span
                          title={`Intent ${c.highest_intent_score ?? 0}/10 — ${
                            (c.highest_intent_score ?? 0) <= 2 ? "Low: browsing, no pain expressed" :
                            (c.highest_intent_score ?? 0) <= 5 ? "Medium: pain articulated, evaluating" :
                            (c.highest_intent_score ?? 0) <= 7 ? "High: asked about pricing or demo" :
                            "Very high: booking intent, urgency mentioned"
                          }`}
                          className="font-medium text-[var(--text-1)] tabular-nums cursor-help"
                        >
                          {c.highest_intent_score ?? 0}
                        </span>
                        {c.booking_requested && <span className="text-[10px]">📅</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {(activeView === "cs" || activeView === "support") && risk ? (
                        <span className={`text-[11px] font-medium ${risk.color}`}>{risk.label}</span>
                      ) : (
                        <span className="text-[11px] text-[var(--text-3)]">{c.last_agent_title ?? "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-[11px] text-[var(--text-3)]">
                        {c.last_interaction_at ? timeAgo(c.last_interaction_at) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/ccc/customer/${c.id}`}
                        className="text-xs text-[var(--openui-text-brand)] opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[11px] text-[var(--text-3)] text-right">{filtered.length} of {customers.length} customers</p>
    </div>
  )
}
