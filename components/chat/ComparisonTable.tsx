import type { ComparisonTableData } from "@/lib/componentData"
export default function ComparisonTable({ data }: { data: ComparisonTableData }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{
      backgroundColor: "rgba(255,255,255,0.04)",
      borderColor: "rgba(255,255,255,0.08)",
    }}>
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{data.title}</p>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{
          backgroundColor: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.30)",
        }}>Illustrative</span>
      </div>
      <div className="grid grid-cols-3 gap-0 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="px-4 py-2" />
        <div className="px-4 py-2 border-l" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(248,113,113,0.80)" }}>
            {data.beforeLabel}
          </p>
        </div>
        <div className="px-4 py-2 border-l" style={{ borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(0,168,120,0.05)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#00a878" }}>
            {data.afterLabel}
          </p>
        </div>
      </div>
      {data.rows.map((row, i) => (
        <div key={i} className="grid grid-cols-3 gap-0"
          style={{ borderBottom: i < data.rows.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
          <div className="px-4 py-2.5">
            <p className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>{row.aspect}</p>
          </div>
          <div className="px-4 py-2.5 border-l" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-[12px]" style={{ color: "rgba(248,113,113,0.75)" }}>{row.before}</p>
          </div>
          <div className="px-4 py-2.5 border-l" style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(0,168,120,0.04)" }}>
            <p className="text-[12px] font-medium" style={{ color: "rgba(0,168,120,0.90)" }}>{row.after}</p>
          </div>
        </div>
      ))}
    </div>
  )
}