import type { InsightCardData } from "@/lib/componentData"
export default function InsightCard({ data }: { data: InsightCardData }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{
      backgroundColor: "rgba(0,168,120,0.06)",
      borderColor: "rgba(0,168,120,0.20)",
    }}>
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{ backgroundColor: "rgba(0,168,120,0.15)", border: "1px solid rgba(0,168,120,0.25)" }}>
            💡
          </div>
          <div>
            <p className="text-sm leading-relaxed font-medium" style={{ color: "rgba(255,255,255,0.88)" }}>
              "{data.insight}"
            </p>
            <p className="text-[12px] mt-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{data.context}</p>
            <p className="text-[10px] mt-2 uppercase tracking-wider" style={{ color: "rgba(0,168,120,0.60)" }}>{data.source}</p>
          </div>
        </div>
      </div>
    </div>
  )
}