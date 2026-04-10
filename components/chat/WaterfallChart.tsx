import type { WaterfallData, WaterfallItem } from "@/lib/componentData"

function formatDollar(val: number): string {
  const abs = Math.abs(val)
  const formatted =
    abs >= 1_000_000
      ? `$${(abs / 1_000_000).toFixed(1)}M`
      : abs >= 1_000
      ? `$${(abs / 1_000).toFixed(0)}K`
      : `$${abs}`
  return val < 0 ? `(${formatted})` : formatted
}

function formatPct(val: number, gross: number): string {
  return ((Math.abs(val) / gross) * 100).toFixed(1) + "%"
}

const TYPE_COLORS = {
  revenue:   { bar: "#10b981", text: "#10b981", label: "rgba(255,255,255,0.85)" },
  deduction: { bar: "#f87171", text: "#f87171", label: "rgba(255,255,255,0.75)" },
  subtotal:  { bar: "#38bdf8", text: "#38bdf8", label: "rgba(255,255,255,0.80)" },
  result:    { bar: "#a78bfa", text: "#a78bfa", label: "rgba(255,255,255,0.90)" },
}

function WaterfallRow({ item, grossRevenue }: { item: WaterfallItem; grossRevenue: number }) {
  const colors = TYPE_COLORS[item.type]
  const widthPct = (Math.abs(item.value) / grossRevenue) * 100
  const isDeduction = item.type === "deduction"
  const isResult = item.type === "result"
  const isSubtotal = item.type === "subtotal"

  return (
    <div className="flex items-center gap-2 py-1.5" style={{
      borderBottom: (isSubtotal || isResult) ? "1px solid rgba(255,255,255,0.08)" : undefined,
      marginBottom: (isSubtotal || isResult) ? "4px" : undefined,
      paddingTop: (isSubtotal || isResult) ? "8px" : undefined,
    }}>
      {/* Label */}
      <div className="flex-shrink-0 text-right" style={{ width: "132px" }}>
        <span
          className="text-[11px] font-medium"
          style={{ color: isResult ? colors.label : "rgba(255,255,255,0.55)", fontWeight: isResult || isSubtotal ? 600 : 400 }}
        >
          {item.label}
        </span>
      </div>

      {/* Bar */}
      <div className="flex-1 relative h-5 flex items-center">
        <div
          className="h-3.5 rounded-sm"
          style={{
            width: `${Math.max(widthPct, 1.5)}%`,
            background: colors.bar,
            opacity: isDeduction ? 0.75 : 1,
          }}
        />
      </div>

      {/* Values */}
      <div className="flex-shrink-0 flex gap-3 items-center" style={{ width: "110px" }}>
        <span
          className="text-[11px] tabular-nums font-semibold"
          style={{ color: colors.text, minWidth: "62px", textAlign: "right" }}
        >
          {formatDollar(item.value)}
        </span>
        <span className="text-[10px] tabular-nums" style={{ color: "rgba(255,255,255,0.28)", minWidth: "38px", textAlign: "right" }}>
          {formatPct(item.value, grossRevenue)}
        </span>
      </div>
    </div>
  )
}

function BenchmarkBar({ benchmark, cmPercent }: { benchmark: { p25: number; p50: number; p75: number }; cmPercent: number }) {
  return (
    <div className="mt-4 mb-1">
      <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.30)" }}>
        Industry CM% Benchmark (DTC Apparel / Home)
      </p>
      <div className="relative h-5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        {/* Gradient band */}
        <div
          className="absolute top-0 bottom-0 rounded-full"
          style={{
            left: `${benchmark.p25}%`,
            width: `${benchmark.p75 - benchmark.p25}%`,
            background: "linear-gradient(90deg, rgba(16,185,129,0.20), rgba(16,185,129,0.40))",
          }}
        />
        {/* p25 marker */}
        <div className="absolute top-0 bottom-0 w-px" style={{ left: `${benchmark.p25}%`, background: "rgba(16,185,129,0.50)" }} />
        {/* Median marker */}
        <div className="absolute top-0 bottom-0 w-px" style={{ left: `${benchmark.p50}%`, background: "#10b981" }} />
        {/* p75 marker */}
        <div className="absolute top-0 bottom-0 w-px" style={{ left: `${benchmark.p75}%`, background: "rgba(16,185,129,0.50)" }} />
        {/* Your CM marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 rounded-full"
          style={{ left: `${cmPercent}%`, background: "#a78bfa", boxShadow: "0 0 6px #a78bfa" }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[9px]" style={{ marginLeft: `${benchmark.p25 - 1}%`, color: "rgba(255,255,255,0.28)" }}>P25 · {benchmark.p25}%</span>
        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.40)" }}>Median · {benchmark.p50}%</span>
        <span className="text-[9px]" style={{ marginRight: `${100 - benchmark.p75 - 1}%`, color: "rgba(255,255,255,0.28)" }}>P75 · {benchmark.p75}%</span>
      </div>
    </div>
  )
}

export default function WaterfallChart({ data }: { data: WaterfallData }) {
  const aboveMedian = data.cmPercent >= data.benchmark.p50
  const aboveP75 = data.cmPercent >= data.benchmark.p75

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        <div>
          <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
            Contribution Margin Waterfall
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {data.brand} · {data.period}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {/* CM % badge */}
          <div
            className="px-2.5 py-1 rounded-lg text-center"
            style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)" }}
          >
            <p className="text-lg font-bold leading-none" style={{ color: "#a78bfa" }}>{data.cmPercent.toFixed(1)}%</p>
            <p className="text-[8px] mt-0.5" style={{ color: aboveP75 ? "#10b981" : aboveMedian ? "#fbbf24" : "#f87171" }}>
              {aboveP75 ? "▲ Top quartile" : aboveMedian ? "▲ Above median" : "▼ Below median"}
            </p>
          </div>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 self-start"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.30)" }}
          >
            Illustrative
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-2 px-4 pb-1.5">
        <div className="flex-shrink-0" style={{ width: "132px" }} />
        <div className="flex-1" />
        <div className="flex gap-3 flex-shrink-0" style={{ width: "110px" }}>
          <span className="text-[9px] uppercase tracking-wider text-right" style={{ color: "rgba(255,255,255,0.22)", minWidth: "62px" }}>Amount</span>
          <span className="text-[9px] uppercase tracking-wider text-right" style={{ color: "rgba(255,255,255,0.22)", minWidth: "38px" }}>% Rev</span>
        </div>
      </div>

      {/* Rows */}
      <div className="px-4 pb-2">
        {data.items.map((item, i) => (
          <WaterfallRow key={i} item={item} grossRevenue={data.grossRevenue} />
        ))}
      </div>

      {/* Benchmark bar */}
      <div className="px-4 pb-4">
        <BenchmarkBar benchmark={data.benchmark} cmPercent={data.cmPercent} />
      </div>

      {/* Legend */}
      <div className="px-4 py-2.5 flex flex-wrap items-center gap-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {[
          { color: "#10b981", label: "Revenue" },
          { color: "#f87171", label: "Deductions" },
          { color: "#38bdf8", label: "Subtotals" },
          { color: "#a78bfa", label: "Contribution Margin" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
