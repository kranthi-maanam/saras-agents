const PHASE_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  arrival: {
    label: "Arrival",
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-600 dark:text-zinc-400",
    dot: "bg-zinc-400",
  },
  topic_entry: {
    label: "Topic Entry",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  discovery: {
    label: "Discovery",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  handoff: {
    label: "Handoff",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
}

interface PhaseBadgeProps {
  phase: string
  size?: "sm" | "md"
}

export function PhaseBadge({ phase, size = "md" }: PhaseBadgeProps) {
  const config = PHASE_CONFIG[phase] ?? {
    label: phase,
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-600 dark:text-zinc-400",
    dot: "bg-zinc-400",
  }

  const sizeClasses = size === "sm"
    ? "px-1.5 py-0.5 text-[10px] gap-1"
    : "px-2 py-0.5 text-xs gap-1.5"

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses}`}>
      <span className={`rounded-full ${config.dot} ${size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5"}`} />
      {config.label}
    </span>
  )
}
