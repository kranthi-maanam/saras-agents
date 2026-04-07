import type { ChannelTableData } from "@/lib/componentData"
export default function ChannelTable({ data }: { data: ChannelTableData }) {
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
      <div className="overflow-x-auto">
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <th className="text-left px-4 py-2 font-medium" style={{ color: "rgba(255,255,255,0.40)" }}>Metric</th>
              {data.channels.map(ch => (
                <th key={ch} className="text-center px-3 py-2 font-medium" style={{ color: "rgba(255,255,255,0.60)" }}>{ch}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.metrics.map((metric, mi) => (
              <tr key={mi} style={{ borderBottom: mi < data.metrics.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <td className="px-4 py-2.5 font-medium" style={{ color: "rgba(255,255,255,0.50)" }}>{metric.label}</td>
                {metric.values.map((val, ci) => {
                  const isBest = ci === metric.bestIdx
                  const isWorst = ci === metric.worstIdx
                  return (
                    <td key={ci} className="text-center px-3 py-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{
                        backgroundColor: isBest ? "rgba(0,168,120,0.15)" : isWorst ? "rgba(248,113,113,0.12)" : "transparent",
                        color: isBest ? "#00a878" : isWorst ? "#f87171" : "rgba(255,255,255,0.70)",
                      }}>{val}</span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 flex items-center gap-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#00a878" }} />
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>Best in category</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f87171" }} />
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>Needs attention</p>
        </div>
      </div>
    </div>
  )
}