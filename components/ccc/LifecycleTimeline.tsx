"use client"

import { useState } from "react"
import { InteractionCard } from "@/components/ccc/InteractionCard"
import { InteractionDrawer } from "@/components/ccc/InteractionDrawer"
import type { CccInteraction } from "@/lib/cccWriter"

// Full 9-stage lifecycle from Krishna's Customer Lifecycle Map
const STAGES = [
  { id: "all",         label: "All" },
  { id: "marketing",   label: "Awareness" },
  { id: "discovery",   label: "Discovery" },
  { id: "mql",         label: "MQL" },
  { id: "sales",       label: "Sales" },
  { id: "onboarding",  label: "Onboarding" },
  { id: "product_use", label: "Product" },
  { id: "support",     label: "Support" },
  { id: "cs",          label: "CS" },
  { id: "renewal",     label: "Renewal" },
]

type Interaction = CccInteraction & { id: string; created_at: string }

interface LifecycleTimelineProps {
  interactions: Interaction[]
}

export function LifecycleTimeline({ interactions }: LifecycleTimelineProps) {
  const [activeStage, setActiveStage] = useState("all")
  const [drawerInteraction, setDrawerInteraction] = useState<Interaction | null>(null)

  const filtered =
    activeStage === "all"
      ? interactions
      : interactions.filter((i) => i.lifecycle_stage === activeStage)

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="space-y-4">
      {/* Stage filter tabs — horizontally scrollable */}
      <div className="overflow-x-auto pb-1">
        <div
          role="tablist"
          aria-label="Filter by lifecycle stage"
          suppressHydrationWarning
          className="flex items-center gap-1 p-1 rounded-lg bg-[var(--openui-sunk)] w-fit"
        >
          {STAGES.map((stage) => {
            const count =
              stage.id === "all"
                ? interactions.length
                : interactions.filter((i) => i.lifecycle_stage === stage.id).length
            if (count === 0 && stage.id !== "all") return null
            return (
              <button
                key={stage.id}
                role="tab"
                aria-selected={activeStage === stage.id}
                suppressHydrationWarning
                onClick={() => setActiveStage(stage.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  activeStage === stage.id
                    ? "bg-[var(--openui-elevated)] text-[var(--text-1)] shadow-sm"
                    : "text-[var(--text-2)] hover:text-[var(--text-1)]"
                }`}
              >
                {stage.label}
                {count > 0 && (
                  <span className="ml-1 text-[10px] text-[var(--text-3)]">{count}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Hint */}
      {sorted.length > 0 && (
        <p className="text-[10px] text-[var(--text-3)]">Click any interaction to view full detail</p>
      )}

      {/* Interactions */}
      {sorted.length === 0 ? (
        <p className="text-sm text-[var(--text-3)] py-4">No interactions in this stage.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((interaction) => (
            <InteractionCard
              key={interaction.id}
              interaction={interaction}
              onClick={() => setDrawerInteraction(interaction)}
            />
          ))}
        </div>
      )}

      {/* Drawer */}
      <InteractionDrawer
        interaction={drawerInteraction}
        onClose={() => setDrawerInteraction(null)}
      />
    </div>
  )
}
