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

// ── Insight Card ──────────────────────────────────────────────────────────
export interface InsightCardData {
  title: string
  subtitle: string
  insights: { icon: string; label: string; detail: string; severity: "high" | "medium" | "low" }[]
}

export const SARAS_IQ_INSIGHT_DATA: InsightCardData = {
  title: "Saras IQ — Live Alerts",
  subtitle: "AI-detected anomalies and opportunities · Updated 6 min ago",
  insights: [
    { icon: "🔴", label: "Revenue anomaly detected", detail: "Tuesday revenue dropped 31% vs 4-week avg — Meta Ads CPM spiked $18 above baseline.", severity: "high" },
    { icon: "🟡", label: "LTV cohort divergence", detail: "Mar '24 cohort showing 22% higher 6-month LTV than Apr '24. Investigate acquisition mix.", severity: "medium" },
    { icon: "🟢", label: "Email revenue opportunity", detail: "Winback flow last sent 47 days ago. Segment of 12,400 lapsed customers ready to re-engage.", severity: "low" },
  ],
}

export const DATA_WAREHOUSE_INSIGHT_DATA: InsightCardData = {
  title: "Warehouse Quality Report",
  subtitle: "dbt model health · BigQuery · Last run 12 min ago",
  insights: [
    { icon: "🔴", label: "Schema drift detected", detail: "Shopify orders table: 3 new columns not mapped in `stg_orders` model. Downstream models may break.", severity: "high" },
    { icon: "🟡", label: "Freshness warning", detail: "`fct_revenue_daily` last updated 26 hours ago. SLA is 4 hours. Investigate Fivetran connector.", severity: "medium" },
    { icon: "🟢", label: "Test coverage strong", detail: "94% of models have not-null + unique tests. 2 new models added this week are fully tested.", severity: "low" },
  ],
}

// ── Comparison Table ──────────────────────────────────────────────────────
export interface ComparisonTableData {
  title: string
  subtitle: string
  rows: { metric: string; yours: string; p50: string; p75: string; status: "good" | "warn" | "bad" }[]
}

export const CM_COMPARISON_DATA: ComparisonTableData = {
  title: "Contribution Margin Benchmarks",
  subtitle: "Your brand vs DTC peers · $50M–$200M revenue segment",
  rows: [
    { metric: "CM %",           yours: "28%",  p50: "24%",  p75: "32%",  status: "good" },
    { metric: "COGS %",         yours: "40%",  p50: "42%",  p75: "36%",  status: "good" },
    { metric: "Paid Media %",   yours: "18%",  p50: "16%",  p75: "12%",  status: "warn" },
    { metric: "Returns %",      yours: "9%",   p50: "8%",   p75: "5%",   status: "warn" },
    { metric: "Fulfillment %",  yours: "11%",  p50: "10%",  p75: "8%",   status: "warn" },
  ],
}

export const MARKETING_COMPARISON_DATA: ComparisonTableData = {
  title: "Marketing Efficiency Benchmarks",
  subtitle: "Your brand vs DTC peers · Last 30 days",
  rows: [
    { metric: "Blended ROAS",    yours: "2.8×",  p50: "2.5×",  p75: "3.5×",  status: "good" },
    { metric: "CAC (Paid)",      yours: "$38",   p50: "$42",   p75: "$28",   status: "good" },
    { metric: "CAC Payback",     yours: "4.2mo", p50: "4.5mo", p75: "2.8mo", status: "good" },
    { metric: "Email % Revenue", yours: "18%",   p50: "22%",   p75: "32%",   status: "bad"  },
    { metric: "Conv. Rate",      yours: "3.1%",  p50: "2.9%",  p75: "4.2%",  status: "good" },
  ],
}

// ── Onboarding Preview ────────────────────────────────────────────────────
export interface OnboardingPreviewData {
  title: string
  subtitle: string
  steps: { step: number; title: string; detail: string; duration: string }[]
}

export const ONBOARDING_PREVIEW_DATA: OnboardingPreviewData = {
  title: "Get Live in 48 Hours",
  subtitle: "No engineers needed. Saras connects directly to your stack.",
  steps: [
    { step: 1, title: "Connect your data sources",  detail: "Shopify, Amazon, Meta, Google, Klaviyo, your 3PL — 100+ native connectors.", duration: "30 min" },
    { step: 2, title: "Saras normalises your data",  detail: "Pre-built dbt models clean, join, and enrich your data automatically.", duration: "Automated" },
    { step: 3, title: "Agents go live",              detail: "All 8 domain agents activate with your real data. No dashboard configuration.", duration: "< 24 hrs" },
    { step: 4, title: "Invite your team",            detail: "Role-based access for CFO, CMO, Ops leads. Each sees their domain instantly.", duration: "5 min" },
  ],
}

// ── Signup CTA ────────────────────────────────────────────────────────────
export interface SignupCTAData {
  headline: string
  subline: string
  features: string[]
  ctaLabel: string
  ctaHref: string
}

export const SIGNUP_CTA_DATA: SignupCTAData = {
  headline: "See Saras AI with your own data",
  subline: "Join 50+ DTC brands already running on Saras. Setup takes 48 hours.",
  features: [
    "All 8 domain agents included",
    "100+ native connectors — no engineers needed",
    "Pre-built dbt models for instant insights",
    "Dedicated onboarding specialist",
  ],
  ctaLabel: "Book a personalised demo →",
  ctaHref: "https://sarasanalytics.com/demo",
}
