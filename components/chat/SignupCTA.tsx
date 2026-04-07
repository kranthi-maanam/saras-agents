"use client"
import { ArrowUpRight } from "lucide-react"
import type { SignupCTAData } from "@/lib/componentData"
interface Props {
  data: SignupCTAData
  userName?: string
  email?: string
  onCtaClick?: () => void
}
export default function SignupCTA({ data, userName, email, onCtaClick }: Props) {
  function handleClick() {
    const params = new URLSearchParams()
    if (userName) params.set("name", userName)
    if (email) params.set("email", email)
    const url = data.ctaUrl + (params.toString() ? `&${params.toString()}` : "")
    window.open(url, "_blank", "noopener")
    onCtaClick?.()
  }
  return (
    <div className="rounded-2xl overflow-hidden" style={{
      backgroundColor: "rgba(0,168,120,0.08)",
      border: "1px solid rgba(0,168,120,0.25)",
    }}>
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(0,168,120,0.70)" }}>
              Recommended for you
            </p>
            <p className="text-sm font-bold" style={{ color: "#fff" }}>{data.productName}</p>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              {data.description}
            </p>
          </div>
        </div>
        <button onClick={handleClick}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-150"
          style={{ backgroundColor: "#00a878", color: "#fff" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#00c48f")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#00a878")}
        >
          {data.ctaLabel}
          <ArrowUpRight size={15} />
        </button>
        <p className="text-center text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.28)" }}>
          {data.timeEstimate}
        </p>
      </div>
    </div>
  )
}