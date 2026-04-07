import type { FlowDiagramData } from "@/lib/componentData"
const STATUS_COLORS = {
  ok:      { bg: "rgba(0,168,120,0.12)",    border: "rgba(0,168,120,0.30)",    dot: "#00a878" },
  broken:  { bg: "rgba(248,113,113,0.08)",  border: "rgba(248,113,113,0.25)",  dot: "#f87171" },
  pending: { bg: "rgba(251,191,36,0.08)",   border: "rgba(251,191,36,0.25)",   dot: "#fbbf24" },
  default: { bg: "rgba(255,255,255,0.04)",  border: "rgba(255,255,255,0.10)",  dot: "rgba(255,255,255,0.30)" },
}
export default function FlowDiagram({ data }: { data: FlowDiagramData }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{
      backgroundColor: "rgba(255,255,255,0.04)",
      borderColor: "rgba(255,255,255,0.08)",
    }}>
      <div className="flex items-start justify-between px-4 pt-3 pb-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{data.title}</p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{data.subtitle}</p>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{
          backgroundColor: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.30)",
        }}>Illustrative</span>
      </div>
      <div className="px-4 pb-4 space-y-1.5">
        {data.steps.map((step, i) => {
          const colors = STATUS_COLORS[step.status ?? "default"]
          const isLast = i === data.steps.length - 1
          return (
            <div key={i} className="relative">
              {!isLast && (
                <div className="absolute left-[19px] top-10 w-px"
                  style={{ height: 8, backgroundColor: "rgba(255,255,255,0.10)" }} />
              )}
              <div className="flex items-start gap-3 rounded-xl px-3 py-2.5"
                style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base leading-none"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[12px] font-semibold leading-tight" style={{ color: "rgba(255,255,255,0.80)" }}>
                      {step.title}
                    </p>
                    {step.status && step.status !== "ok" && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{
                        backgroundColor: step.status === "broken" ? "rgba(248,113,113,0.15)" : "rgba(251,191,36,0.15)",
                        color: step.status === "broken" ? "#f87171" : "#fbbf24",
                      }}>
                        {step.status === "broken" ? "⚠ breaks here" : "pending"}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.40)" }}>
                    {step.description}
                  </p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: colors.dot }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}