import { notFound } from "next/navigation"
import Link from "next/link"
import { getSupabase } from "@/lib/supabase/server"
import { DEMO_CUSTOMERS, DEMO_INTERACTIONS } from "@/lib/cccDemoData"
import { LifecycleTimeline } from "@/components/ccc/LifecycleTimeline"
import { SignalsSidebar } from "@/components/ccc/SignalsSidebar"
import { AIAnalysisPanel } from "@/components/ccc/AIAnalysisPanel"
import type { CccRecord, CccInteraction } from "@/lib/cccWriter"

export const dynamic = "force-dynamic"

type Customer = CccRecord & { id: string; created_at: string }
type Interaction = CccInteraction & { id: string; created_at: string }

async function getCustomer(id: string): Promise<{ customer: Customer; interactions: Interaction[] } | null> {
  const demoCustomer = DEMO_CUSTOMERS.find((c) => c.id === id)
  if (demoCustomer) {
    return {
      customer: demoCustomer,
      interactions: DEMO_INTERACTIONS.filter((i) => i.customer_id === id),
    }
  }

  const sb = getSupabase()
  if (!sb) return null

  const [customerRes, interactionsRes] = await Promise.all([
    sb.from("ccc_records").select("*").eq("id", id).single(),
    sb.from("ccc_interactions").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
  ])

  if (customerRes.error || !customerRes.data) return null
  return {
    customer: customerRes.data,
    interactions: interactionsRes.data ?? [],
  }
}

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { id } = await params
  const sp = await searchParams
  const view = sp.view ?? "all"

  const result = await getCustomer(id)
  if (!result) notFound()

  const { customer, interactions } = result

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <Link href={`/ccc${view !== "all" ? `?view=${view}` : ""}`} className="text-xs text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
          ← All Customers
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-1)]" style={{ fontFamily: "var(--font-heading)" }}>
              {customer.name ?? customer.email}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {customer.role && <span className="text-sm text-[var(--text-2)]">{customer.role}</span>}
              {customer.company && (
                <>
                  <span className="text-[var(--text-3)]">·</span>
                  <span className="text-sm text-[var(--text-2)]">{customer.company}</span>
                </>
              )}
              {customer.revenue_range && (
                <>
                  <span className="text-[var(--text-3)]">·</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--openui-sunk)] text-[var(--text-2)]">
                    {customer.revenue_range}
                  </span>
                </>
              )}
            </div>
            <div className="text-xs text-[var(--text-3)] mt-1">{customer.email}</div>
          </div>
        </div>
      </div>

      {/* AI Analysis — auto-runs on load */}
      <AIAnalysisPanel
        customer={customer}
        interactions={interactions}
        view={view}
        autoRun
      />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left: Timeline */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--text-1)]">Interaction History</h2>
          <LifecycleTimeline interactions={interactions} />
        </div>

        {/* Right: Signals */}
        <div>
          <SignalsSidebar customer={customer} />
        </div>
      </div>
    </div>
  )
}
