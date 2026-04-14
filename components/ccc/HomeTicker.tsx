import Link from "next/link"
import { LiveActivityPanel } from "@/components/ccc/LiveActivityPanel"

interface HomeTickerProps {
  demo?: boolean
}

export function HomeTicker({ demo = false }: HomeTickerProps) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--divider)]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-[var(--text-1)]">Live Activity</span>
        </div>
        <Link
          href="/ccc"
          className="text-[11px] text-[var(--openui-text-brand)] hover:underline font-medium"
        >
          Open CCC →
        </Link>
      </div>

      <div className="px-3 py-2">
        <LiveActivityPanel compact demo={demo} />
      </div>
    </div>
  )
}
