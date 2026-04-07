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

export interface ChannelRow {
  channel: string
  [key: string]: string
}

export interface ChannelTableData {
  headers: string[]
  rows: ChannelRow[]
  highlightKey?: string
}

export interface ComparisonRow {
  label: string
  before: string
  after: string
}

export interface ComparisonTableData {
  title: string
  rows: ComparisonRow[]
}

export interface FlowStep {
  label: string
  detail?: string
  status: "ok" | "broken" | "pending"
}

export interface FlowDiagramData {
  steps: FlowStep[]
}

export interface SignupCTAData {
  cta: string
  product: string
  description?: string
}

export interface OnboardingStep {
  title: string
  description: string
}

export interface OnboardingPreviewData {
  steps: OnboardingStep[]
}

export type ComponentPayload =
  | { type: "insight"; data: InsightCardData }
  | { type: "metric"; data: MetricCardData }
  | { type: "channel_table"; data: ChannelTableData }
  | { type: "comparison"; data: ComparisonTableData }
  | { type: "flow"; data: FlowDiagramData }
  | { type: "cta"; data: SignupCTAData }
  | { type: "onboarding"; data: OnboardingPreviewData }
