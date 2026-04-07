import type {
  WaterfallData,
  CohortData,
  ChannelTableData,
  FlowDiagramData,
  MetricCardData,
} from "@/lib/componentData"

// ── Contribution Margin Waterfall ──────────────────────────────────────────
export const CM_WATERFALL_DATA: WaterfallData = {
  brand: "Luxe Home",
  period: "Last 90 days",
  grossRevenue: 12_000_000,
  items: [
    { label: "Gross Revenue",       value: 12_000_000, type: "revenue"   },
    { label: "Returns & Refunds",   value: -1_080_000, type: "deduction" },
    { label: "Net Revenue",         value: 10_920_000, type: "subtotal"  },
    { label: "COGS",                value: -4_368_000, type: "deduction" },
    { label: "Gross Profit",        value:  6_552_000, type: "subtotal"  },
    { label: "Paid Media",          value: -1_944_000, type: "deduction" },
    { label: "Shipping & Fulfil.",  value: -1_200_000, type: "deduction" },
    { label: "Platform Fees",       value:   -360_000, type: "deduction" },
    { label: "Contribution Margin", value:  3_048_000, type: "result"    },
  ],
  cmPercent: 28.0,
  benchmark: { p25: 18, p50: 24, p75: 32 },
}

// ── Cohort Heatmap ────────────────────────────────────────────────────────
export const COHORT_HEATMAP_DATA: CohortData = {
  brand: "True Classic",
  period: "Jan 2024 – Jun 2024",
  cohorts: [
    { month: "Jan '24", size: 4820, retention: [100, 38, 24, 19, 16, 14, 13, 12, 11, 10, 10, 9] },
    { month: "Feb '24", size: 5310, retention: [100, 41, 27, 21, 18, 16, 14, 13, 12, 11, 10, null] },
    { month: "Mar '24", size: 6140, retention: [100, 43, 29, 23, 20, 17, 15, 14, 13, 12, null, null] },
    { month: "Apr '24", size: 5870, retention: [100, 39, 26, 20, 17, 15, 13, 12, 11, null, null, null] },
    { month: "May '24", size: 7020, retention: [100, 44, 30, 24, 21, 18, 16, 15, null, null, null, null] },
    { month: "Jun '24", size: 8440, retention: [100, 46, 32, 26, null, null, null, null, null, null, null, null] },
  ],
  benchmark12mRetention: 9,
}

// ── Marketing Channels Table ──────────────────────────────────────────────
export const MARKETING_CHANNEL_DATA: ChannelTableData = {
  title: "Channel Performance",
  subtitle: "Last 30 days · Blended attribution",
  channels: ["Meta Ads", "Google Ads", "Email", "SMS", "Affiliates"],
  metrics: [
    { label: "Spend",         values: ["$148K", "$92K",  "—",    "—",   "$18K" ], bestIdx: 2, worstIdx: 4 },
    { label: "Revenue",       values: ["$444K", "$230K", "$186K","$74K","$27K" ], bestIdx: 0, worstIdx: 4 },
    { label: "ROAS",          values: ["3.0×",  "2.5×",  "∞",    "∞",   "1.5×" ], bestIdx: 2, worstIdx: 4 },
    { label: "CAC",           values: ["$38",   "$44",   "$12",  "$8",  "$67"  ], bestIdx: 3, worstIdx: 4 },
    { label: "Conv. Rate",    values: ["2.8%",  "3.1%",  "4.4%", "5.2%","1.6%" ], bestIdx: 3, worstIdx: 4 },
    { label: "New vs Return", values: ["72/28", "68/32", "22/78","15/85","80/20"], bestIdx: 1, worstIdx: 0 },
  ],
}

// ── Pipeline Flow ─────────────────────────────────────────────────────────
export const PIPELINES_FLOW_DATA: FlowDiagramData = {
  title: "Data Pipeline Health",
  subtitle: "Live connector status · Synced 4 min ago",
  steps: [
    { icon: "🛒", title: "Shopify Orders",    status: "ok",      description: "12,841 orders synced · Last updated 4 min ago · 0 errors" },
    { icon: "📧", title: "Klaviyo Events",     status: "ok",      description: "2.3M email events · 98.7% delivery rate · Flows active" },
    { icon: "📦", title: "Inventory / 3PL",    status: "broken",  description: "ShipBob webhook failing since 02:14 AM · 847 rows missing" },
    { icon: "💳", title: "Stripe Payments",    status: "ok",      description: "All transactions reconciled · LTV calculation current" },
    { icon: "📊", title: "Google Analytics 4", status: "pending", description: "Schema migration in progress · ETA 45 min · Backfill queued" },
    { icon: "🏭", title: "Data Warehouse",     status: "ok",      description: "BigQuery · 1.2TB ingested this week · dbt models passing" },
  ],
}

// ── Inventory Metrics ─────────────────────────────────────────────────────
export const INVENTORY_METRIC_DATA: MetricCardData = {
  metric: "Inventory Health Score",
  value: "73 / 100",
  delta: "−8 vs last month",
  benchmark: "Industry avg: 81",
  context:
    "14 SKUs at stockout risk within 21 days. Top concern: 'Canvas Tote — Natural' (6 days remaining). Reorder lead time is 28 days — you are already behind on 3 SKUs.",
}
