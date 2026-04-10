import type { CohortData } from "@/lib/componentData"

function retentionColor(val: number | null): string {
  if (val === null) return "rgba(255,255,255,0.03)"
  if (val === 100) return "rgba(16,185,129,0.60)"
  if (val >= 40)   return `rgba(16,185,129,${(val / 100) * 0.55 + 0.05})`
  if (val >= 20)   return `rgba(251,191,36,${(val / 100) * 0.70 + 0.10})`
  return             `rgba(248,113,113,${(val / 100) * 0.70 + 0.15})`
}

function retentionTextColor(val: number | null): string {
  if (val === null) return "transparent"
  if (val >= 40) return "rgba(255,255,255,0.85)"
  if (val >= 20) return "rgba(255,255,255,0.75)"
  return "rgba(255,255,255,0.65)"
}

export default function CohortHeatmap({ data }: { data: CohortData }) {
  const months = 12
  const monthLabels = Array.from({ length: months }, (_, i) => `M${i + 1}`)

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        <div>
          <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
            Customer Retention Heatmap
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {data.brand} · {data.period}
          </p>
        </div>
        <span
          className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5"
          style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.30)" }}
        >
          Illustrative
        </span>
      </div>

      {/* Grid */}
      <div className="px-4 pb-1 overflow-x-auto">
        <div style={{ minWidth: "520px" }}>
          {/* Column headers */}
          <div className="flex gap-0.5 mb-1">
            <div style={{ width: "76px", flexShrink: 0 }} />
            <div style={{ width: "52px", flexShrink: 0 }} />
            {monthLabels.map((m) => (
              <div
                key={m}
                className="flex-1 text-center text-[9px]"
                style={{ color: "rgba(255,255,255,0.28)" }}
              >
                {m}
              </div>
            ))}
          </div>

          {/* Cohort rows */}
          {data.cohorts.map((cohort) => (
            <div key={cohort.month} className="flex gap-0.5 mb-0.5 items-center">
              {/* Month label */}
              <div
                className="text-[10px] text-right pr-2 flex-shrink-0"
                style={{ width: "76px", color: "rgba(255,255,255,0.45)" }}
              >
                {cohort.month}
              </div>
              {/* Size */}
              <div
                className="text-[9px] text-right pr-2 flex-shrink-0 tabular-nums"
                style={{ width: "52px", color: "rgba(255,255,255,0.25)" }}
              >
                {cohort.size >= 1000 ? `${(cohort.size / 1000).toFixed(1)}K` : cohort.size}
              </div>
              {/* Retention cells */}
              {cohort.retention.map((val, mi) => (
                <div
                  key={mi}
                  className="flex-1 h-7 rounded-sm flex items-center justify-center text-[9px] tabular-nums font-semibold"
                  style={{
                    backgroundColor: retentionColor(val),
                    color: retentionTextColor(val),
                  }}
                >
                  {val !== null ? `${val}%` : ""}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark + Legend */}
      <div className="px-4 py-3 border-t mt-2 flex flex-wrap items-center gap-4 justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: "rgba(248,113,113,0.60)" }} />
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>{"<20%"}</span>
          <div className="w-2 h-2 rounded-sm ml-2" style={{ backgroundColor: "rgba(251,191,36,0.50)" }} />
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>20–40%</span>
          <div className="w-2 h-2 rounded-sm ml-2" style={{ backgroundColor: "rgba(16,185,129,0.55)" }} />
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>{"≥40%"}</span>
        </div>
        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          Industry 12M benchmark: {data.benchmark12mRetention}%
        </span>
      </div>
    </div>
  )
}
