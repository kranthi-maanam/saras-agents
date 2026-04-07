export type DemoComponentType =
  | "cm_waterfall"
  | "cohort_heatmap"
  | "marketing_channels"
  | "pipeline_flow"
  | "inventory_metrics"

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
]

export function detectDemoTrigger(tileId: string, message: string): DemoComponentType | null {
  const lower = message.toLowerCase()
  const match = TRIGGERS.find(
    (t) => t.tileId === tileId && t.keywords.some((k) => lower.includes(k))
  )
  return match?.component ?? null
}
