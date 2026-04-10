export type DemoComponentType =
  | "cm_waterfall"
  | "cohort_heatmap"
  | "marketing_channels"
  | "pipeline_flow"
  | "inventory_metrics"
  | "metric_card"
  | "insight_card"
  | "comparison_table"
  | "signup_cta"
  | "onboarding_preview"
  | "insight_summary"

const TRIGGERS: { tileId: string; keywords: string[]; component: DemoComponentType }[] = [
  {
    tileId: "contribution-margin",
    keywords: ["breakdown", "waterfall", "cm", "margin", "p&l", "gross", "net revenue", "contribution", "cogs", "profitability"],
    component: "cm_waterfall",
  },
  {
    tileId: "cohorts",
    keywords: ["retention", "cohort", "ltv", "repeat", "churn", "lifetime", "returning", "purchase frequency"],
    component: "cohort_heatmap",
  },
  {
    tileId: "marketing-sales",
    keywords: ["channel", "roas", "attribution", "spend", "cac", "meta", "google", "marketing", "paid", "blended"],
    component: "marketing_channels",
  },
  {
    tileId: "pipelines",
    keywords: ["pipeline", "connector", "sync", "flow", "health", "shopify", "klaviyo", "fivetran", "status"],
    component: "pipeline_flow",
  },
  {
    tileId: "inventory-planning",
    keywords: ["inventory", "stock", "sku", "reorder", "sell-through", "sellthrough", "stockout", "days of stock"],
    component: "inventory_metrics",
  },
  // saras-iq and data-warehousing — insight card
  {
    tileId: "saras-iq",
    keywords: ["insight", "alert", "anomaly", "detect", "opportunity", "flag", "surface", "recommend"],
    component: "insight_card",
  },
  {
    tileId: "data-warehousing",
    keywords: ["warehouse", "bigquery", "schema", "dbt", "model", "transform", "table", "data quality"],
    component: "insight_card",
  },
  // comparison table across tiles
  {
    tileId: "contribution-margin",
    keywords: ["compare", "benchmark", "vs", "versus", "peer", "industry", "competitor"],
    component: "comparison_table",
  },
  {
    tileId: "marketing-sales",
    keywords: ["compare", "benchmark", "vs", "versus", "peer", "industry"],
    component: "comparison_table",
  },
  // saras-agent — onboarding preview
  {
    tileId: "saras-agent",
    keywords: ["onboard", "setup", "connect", "get started", "integrate", "how does it work", "implementation"],
    component: "onboarding_preview",
  },
  // signup CTA — high-intent across all tiles
  {
    tileId: "saras-agent",
    keywords: ["pricing", "sign up", "signup", "trial", "demo", "start", "book", "schedule"],
    component: "signup_cta",
  },
]

// Map AI-returned component type strings to DemoComponentType keys
const COMPONENT_TYPE_MAP: Record<string, DemoComponentType> = {
  MetricCard:         "metric_card",
  WaterfallChart:     "cm_waterfall",
  CohortHeatmap:      "cohort_heatmap",
  ChannelTable:       "marketing_channels",
  FlowDiagram:        "pipeline_flow",
  InsightCard:        "insight_card",
  ComparisonTable:    "comparison_table",
  SignupCTA:          "signup_cta",
  OnboardingPreview:  "onboarding_preview",
  InsightSummaryCard: "insight_summary",
}

export function mapAIComponentType(type: string): DemoComponentType | null {
  return COMPONENT_TYPE_MAP[type] ?? null
}

export function detectDemoTrigger(tileId: string, message: string): DemoComponentType | null {
  const lower = message.toLowerCase()
  const match = TRIGGERS.find(
    (t) => t.tileId === tileId && t.keywords.some((k) => lower.includes(k))
  )
  return match?.component ?? null
}
