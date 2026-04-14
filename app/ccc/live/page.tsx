import { getSupabase } from "@/lib/supabase/server"
import { DEMO_ACTIVITY_FEED } from "@/lib/cccDemoData"
import { LiveActivityPanel } from "@/components/ccc/LiveActivityPanel"
import type { ActivityLogEntry } from "@/lib/cccWriter"

export const dynamic = "force-dynamic"

type ActivityEntry = ActivityLogEntry & { id: string; created_at: string }

async function getRecentActivity(): Promise<{ entries: ActivityEntry[]; demo: boolean }> {
  const sb = getSupabase()
  if (!sb) return { entries: [], demo: true }

  const { data, error } = await sb
    .from("agent_activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error || !data || data.length === 0) {
    return { entries: DEMO_ACTIVITY_FEED as ActivityEntry[], demo: true }
  }

  return { entries: data, demo: false }
}

export default async function LiveFeedPage() {
  const { entries, demo } = await getRecentActivity()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-1)]" style={{ fontFamily: "var(--font-heading)" }}>
            Live Feed
          </h1>
          <p className="text-sm text-[var(--text-2)] mt-0.5">
            Real-time activity across all Saras agents.
            {demo && " (Demo mode — connect Supabase to see live data)"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 mt-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs text-[var(--text-2)]">Live</span>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
        <LiveActivityPanel initialEntries={entries} demo={demo} />
      </div>
    </div>
  )
}
