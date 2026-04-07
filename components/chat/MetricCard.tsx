import type { MetricCardData } from "@/lib/componentData"
export default function MetricCard({ data }: { data: MetricCardData }) {
  const isNegative = data.delta.startsWith("−") || data.delta.startsWith("-")
  return (
    <div className="rounded-2xl overflow-hidden border" style={{
      backgroundColor: "rgba(255,255,255,0.04)",
      borderColor: "rgba(255,255,255,0.08)",
    }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-0">
        <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
          {data.metric}
        </p>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{
          backgroundColor: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.30)",
        }}>Illustrative</span>
      </div>
      <div className="px-4 py-4 flex items-end gap-6">
        <div>
          <p className="text-3xl font-bold tracking-tight" style={{ color: "#fff" }}>{data.value}</p>
          <p className="text-xs mt-1" style={{ color: isNegative ? "#f87171" : "#4ade80" }}>{data.delta}</p>
        </div>
        <div className="flex-1 border-l pl-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.28)" }}>
            Industry benchmark
          </p>
          <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.70)" }}>{data.benchmark}</p>
        </div>
      </div>
      <div className="px-4 pb-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-[11px] pt-2.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>{data.context}</p>
      </div>
    </div>
  )
}