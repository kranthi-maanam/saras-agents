"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"

export const VIEWS = [
  { id: "all",        label: "All",        owner: "CEO",              desc: "Full customer list — all signals" },
  { id: "marketing",  label: "Marketing",  owner: "Sarath",           desc: "Awareness leads, entry agents, MQL quality" },
  { id: "pre-sales",  label: "Pre-Sales",  owner: "Balaji",           desc: "Warm prospects — agent-qualified, not yet booked" },
  { id: "sales",      label: "Sales",      owner: "Balaji",           desc: "Booked or high-intent pipeline" },
  { id: "cs",         label: "CS",         owner: "Chai",             desc: "Active customers, retention risk, renewal" },
  { id: "support",    label: "Support",    owner: "Support",          desc: "Open tickets, active issues" },
  { id: "experience", label: "Experience", owner: "PM / Design",      desc: "Pain points, drop-off signals, UX depth" },
  { id: "delivery",   label: "Delivery",   owner: "Engineering",      desc: "Agent depth, session health, phase completion" },
] as const

export type ViewId = (typeof VIEWS)[number]["id"]

interface ViewTabsProps {
  active: ViewId
}

export function ViewTabs({ active }: ViewTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setView(id: ViewId) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", id)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="w-full overflow-x-auto">
      <div
        role="tablist"
        aria-label="Customer view"
        suppressHydrationWarning
        className="flex items-center gap-1 p-1 rounded-xl bg-[var(--openui-sunk)] w-fit min-w-full sm:min-w-0"
      >
        {VIEWS.map((view) => {
          const isActive = view.id === active
          return (
            <button
              key={view.id}
              role="tab"
              aria-selected={isActive}
              suppressHydrationWarning
              onClick={() => setView(view.id)}
              title={`${view.owner} — ${view.desc}`}
              className={`relative flex flex-col items-center px-3 py-1.5 rounded-lg transition-all whitespace-nowrap group ${
                isActive
                  ? "bg-[var(--openui-elevated)] shadow-sm"
                  : "hover:bg-[var(--openui-elevated)]/60"
              }`}
            >
              <span className={`text-xs font-semibold ${isActive ? "text-[var(--text-1)]" : "text-[var(--text-2)]"}`}>
                {view.label}
              </span>
              <span className={`text-[9px] ${isActive ? "text-[var(--openui-text-brand)]" : "text-[var(--text-3)]"}`}>
                {view.owner}
              </span>

              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-10 hidden group-hover:block">
                <div className="bg-[var(--text-1)] text-[var(--openui-text-white)] text-[10px] px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg max-w-[200px] text-center">
                  {view.desc}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
