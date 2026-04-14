import { getSupabase } from "@/lib/supabase/server"
import { DEMO_CUSTOMERS } from "@/lib/cccDemoData"
import { CustomerList } from "@/components/ccc/CustomerList"
import { ViewTabs } from "@/components/ccc/ViewTabs"
import type { CccRecord } from "@/lib/cccWriter"
import type { ViewId } from "@/components/ccc/ViewTabs"

export const dynamic = "force-dynamic"

const VALID_VIEWS: ViewId[] = ["all", "marketing", "pre-sales", "sales", "cs", "support", "experience", "delivery"]

async function getCustomers(): Promise<(CccRecord & { id: string; created_at: string })[]> {
  const sb = getSupabase()
  if (!sb) return DEMO_CUSTOMERS

  const { data, error } = await sb
    .from("ccc_records")
    .select("*")
    .order("last_interaction_at", { ascending: false })
    .limit(200)

  if (error || !data || data.length === 0) return DEMO_CUSTOMERS
  return data
}

export default async function CCCPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const rawView = params.view ?? "all"
  const activeView: ViewId = VALID_VIEWS.includes(rawView as ViewId) ? (rawView as ViewId) : "all"

  const customers = await getCustomers()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-1)]" style={{ fontFamily: "var(--font-heading)" }}>
          Customers
        </h1>
        <p className="text-sm text-[var(--text-2)] mt-0.5">
          Every visitor who has interacted with a Saras agent — read by everyone, written to continuously.
        </p>
      </div>

      {/* Role view tabs */}
      <ViewTabs active={activeView} />

      {/* Customer list with view-aware filters and stat cards */}
      <CustomerList customers={customers} activeView={activeView} />
    </div>
  )
}
