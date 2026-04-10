export interface InsightCardData {
  insight: string
  context: string
  source: string
}

export interface MetricCardData {
  metric: string
  value: string
  delta: string
  benchmark: string
  context: string
}

// Matches the actual ChannelTable.tsx implementation
export interface ChannelMetric {
  label: string
  values: string[]
  bestIdx?: number
  worstIdx?: number
}

export interface ChannelTableData {
  title: string
  subtitle?: string
  channels: string[]
  metrics: ChannelMetric[]
}

export interface ComparisonRow {
  aspect: string
  before: string
  after: string
}

export interface ComparisonTableData {
  title: string
  beforeLabel?: string
  afterLabel?: string
  rows: ComparisonRow[]
}

// Matches the actual FlowDiagram.tsx implementation
export interface FlowStep {
  icon: string
  title: string
  status: "ok" | "broken" | "pending"
  description: string
}

export interface FlowDiagramData {
  title: string
  subtitle?: string
  steps: FlowStep[]
}

export interface SignupCTAData {
  cta: string
  product: string
  description?: string
  ctaUrl: string
  productName: string
  ctaLabel: string
  timeEstimate?: string
}

export interface OnboardingStep {
  icon?: string
  title: string
  description: string
}

export interface OnboardingPreviewData {
  totalTime?: string
  steps: OnboardingStep[]
}

// ── Waterfall Chart ────────────────────────────────────────────────────────
export interface WaterfallItem {
  label: string
  value: number
  type: "revenue" | "deduction" | "subtotal" | "result"
}

export interface WaterfallData {
  brand: string
  period: string
  grossRevenue: number
  items: WaterfallItem[]
  cmPercent: number
  benchmark: { p25: number; p50: number; p75: number }
}

// ── Cohort Heatmap ─────────────────────────────────────────────────────────
export interface CohortRow {
  month: string
  size: number
  retention: (number | null)[]
}

export interface CohortData {
  brand: string
  period: string
  cohorts: CohortRow[]
  benchmark12mRetention: number
}

export type ComponentPayload =
  | { type: "insight"; data: InsightCardData }
  | { type: "metric"; data: MetricCardData }
  | { type: "channel_table"; data: ChannelTableData }
  | { type: "comparison"; data: ComparisonTableData }
  | { type: "flow"; data: FlowDiagramData }
  | { type: "cta"; data: SignupCTAData }
  | { type: "onboarding"; data: OnboardingPreviewData }
  | { type: "waterfall"; data: WaterfallData }
  | { type: "cohort"; data: CohortData }
