import type { OnboardingPreviewData } from "@/lib/componentData"
export default function OnboardingPreview({ data }: { data: OnboardingPreviewData }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{
      backgroundColor: "rgba(255,255,255,0.04)",
      borderColor: "rgba(255,255,255,0.08)",
    }}>
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
            What the next {data.totalTime} look like
          </p>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>3 steps</span>
        </div>
      </div>
      <div className="px-4 pb-4 space-y-2 mt-3">
        {data.steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{ backgroundColor: "rgba(0,168,120,0.12)", border: "1px solid rgba(0,168,120,0.20)" }}>
              {step.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(0,168,120,0.20)", color: "#00a878" }}>{i + 1}</span>
                <p className="text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.80)" }}>{step.title}</p>
              </div>
              <p className="text-[11px] mt-0.5 ml-6 leading-relaxed" style={{ color: "rgba(255,255,255,0.40)" }}>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}