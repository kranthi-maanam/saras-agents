"use client"
import type { DemoComponentType } from "@/lib/demoTriggers"
import WaterfallChart from "@/components/chat/WaterfallChart"
import CohortHeatmap from "@/components/chat/CohortHeatmap"
import ChannelTable from "@/components/chat/ChannelTable"
import FlowDiagram from "@/components/chat/FlowDiagram"
import MetricCard from "@/components/chat/MetricCard"
import InsightCard from "@/components/chat/InsightCard"
import ComparisonTable from "@/components/chat/ComparisonTable"
import SignupCTA from "@/components/chat/SignupCTA"
import OnboardingPreview from "@/components/chat/OnboardingPreview"
import InsightSummaryCard from "@/components/chat/InsightSummaryCard"
import {
  CM_WATERFALL_DATA,
  COHORT_HEATMAP_DATA,
  MARKETING_CHANNEL_DATA,
  PIPELINES_FLOW_DATA,
  INVENTORY_METRIC_DATA,
} from "@/lib/demoData"
import {
  Card,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  FollowUpBlock,
  FollowUpItem,
} from "@openuidev/react-ui"

interface Props {
  type: DemoComponentType
  visitorName?: string
  visitorEmail?: string
  visitorRole?: string
  insights?: string[]
}

const FOLLOW_UPS: Partial<Record<DemoComponentType, string[]>> = {
  cm_waterfall: [
    "I'd like to dig into our shipping costs",
    "Can you walk me through returns impact?",
    "Tell me more about how you calculate this",
  ],
  cohort_heatmap: [
    "I want to understand our repeat buyers better",
    "How do you define a profitable cohort?",
    "What channels are driving our best customers?",
  ],
  marketing_channels: [
    "I'd love to explore our Meta spend deeper",
    "How do you handle attribution differently?",
    "What should I be looking at instead of ROAS?",
  ],
  pipeline_flow: [
    "We're struggling with data freshness — tell me more",
    "How does this connect to our existing warehouse?",
    "What happens when a connector breaks?",
  ],
  inventory_metrics: [
    "We've been dealing with overstock lately",
    "How do you predict demand differently?",
    "Tell me about the reorder automation",
  ],
  insight_card: [
    "What else can you tell me about this?",
    "How would this look for my business?",
    "What's the next thing I should explore?",
  ],
  comparison_table: [
    "How do brands like ours typically improve here?",
    "I'd like to see this for a different metric",
    "What would you recommend we focus on first?",
  ],
  onboarding_preview: [
    "Walk me through the setup process",
    "How quickly can we see our own data?",
    "What integrations do you support?",
  ],
}

export default function ComponentRenderer({ type, visitorName, visitorEmail, visitorRole, insights }: Props) {
  const followUps = FOLLOW_UPS[type] ?? []

  // InsightSummaryCard and SignupCTA render without the Card wrapper
  if (type === "insight_summary") {
    return (
      <InsightSummaryCard
        insights={insights ?? ["This conversation covered key commerce metrics relevant to your role.", "Saras AI can surface these insights automatically for your brand."]}
        visitorName={visitorName}
        visitorEmail={visitorEmail}
        visitorRole={visitorRole}
      />
    )
  }

  if (type === "signup_cta") {
    return (
      <SignupCTA
        data={{
          productName: "Saras AI Commerce Intelligence",
          description: "See all 8 domain agents working with your real data. Setup takes 48 hours.",
          ctaLabel: "Book a personalised demo →",
          ctaUrl: "https://sarasanalytics.com/demo?utm_source=agent-demo",
          cta: "Book demo",
          product: "Saras AI",
          timeEstimate: "30-min session · No commitment",
        }}
        userName={visitorName}
        email={visitorEmail}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Card className="overflow-hidden">
        <DemoContent type={type} />
      </Card>

      {followUps.length > 0 && (
        <FollowUpBlock>
          {followUps.map((q) => (
            <FollowUpItem key={q} text={q} />
          ))}
        </FollowUpBlock>
      )}
    </div>
  )
}

function DemoContent({ type }: { type: DemoComponentType }) {
  switch (type) {
    case "cm_waterfall":
      return (
        <Tabs defaultValue="chart">
          <TabsList>
            <TabsTrigger value="chart" text="Waterfall" />
            <TabsTrigger value="breakdown" text="Breakdown" />
          </TabsList>
          <TabsContent value="chart">
            <WaterfallChart data={CM_WATERFALL_DATA} />
          </TabsContent>
          <TabsContent value="breakdown">
            <div className="p-4 text-sm">
              {CM_WATERFALL_DATA.items.map((item) => (
                <div key={item.label} className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: "var(--divider)" }}>
                  <span style={{ color: "var(--text-2)" }}>{item.label}</span>
                  <span className="font-semibold tabular-nums" style={{ color: item.value >= 0 ? "#10b981" : "#ef4444" }}>
                    {item.value >= 0 ? "+" : ""}${Math.abs(item.value / 1000).toFixed(0)}K
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )

    case "cohort_heatmap":
      return (
        <Tabs defaultValue="heatmap">
          <TabsList>
            <TabsTrigger value="heatmap" text="Heatmap" />
            <TabsTrigger value="summary" text="Summary" />
          </TabsList>
          <TabsContent value="heatmap">
            <CohortHeatmap data={COHORT_HEATMAP_DATA} />
          </TabsContent>
          <TabsContent value="summary">
            <div className="p-4 text-sm" style={{ color: "var(--text-2)" }}>
              <p className="mb-2 font-semibold" style={{ color: "var(--text-1)" }}>Cohort Retention Summary</p>
              <p>Average 3-month retention: <strong>38%</strong></p>
              <p>Average 6-month retention: <strong>22%</strong></p>
              <p>Best cohort: <strong>Jan 2024</strong> at 45% 3-month</p>
            </div>
          </TabsContent>
        </Tabs>
      )

    case "marketing_channels":
      return (
        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table" text="Channels" />
            <TabsTrigger value="roas" text="ROAS" />
          </TabsList>
          <TabsContent value="table">
            <ChannelTable data={MARKETING_CHANNEL_DATA} />
          </TabsContent>
          <TabsContent value="roas">
            <div className="p-4 text-sm">
              <p className="mb-3 font-semibold" style={{ color: "var(--text-1)" }}>ROAS by Channel</p>
              {MARKETING_CHANNEL_DATA.channels.map((ch, idx) => {
                const roasRow = MARKETING_CHANNEL_DATA.metrics.find((m) => m.label === "ROAS")
                const roas = roasRow?.values[idx] ?? "—"
                return (
                  <div key={ch} className="flex justify-between py-1.5 border-b" style={{ borderColor: "var(--divider)" }}>
                    <span style={{ color: "var(--text-2)" }}>{ch}</span>
                    <span className="font-semibold tabular-nums" style={{ color: "var(--text-1)" }}>{roas}</span>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      )

    case "pipeline_flow":
      return <FlowDiagram data={PIPELINES_FLOW_DATA} />

    case "inventory_metrics":
    case "metric_card":
      return <MetricCard data={INVENTORY_METRIC_DATA} />

    case "insight_card":
      return (
        <InsightCard
          data={{
            insight: "Revenue anomaly detected: Tuesday revenue dropped 31% vs 4-week average. Meta Ads CPM spiked $18 above baseline.",
            context: "Saras IQ automatically flagged this pattern at 6:14 AM — before your team's morning standup. Immediate action: pause top-of-funnel Meta campaigns and shift budget to retargeting.",
            source: "Saras IQ · Anomaly Detection · Updated 6 min ago",
          }}
        />
      )

    case "comparison_table":
      return (
        <ComparisonTable
          data={{
            title: "Before vs After Saras AI",
            beforeLabel: "Without Saras",
            afterLabel: "With Saras",
            rows: [
              { aspect: "Time to insight",    before: "3–5 days",         after: "Real-time" },
              { aspect: "Data freshness",      before: "Weekly exports",   after: "< 4 hours" },
              { aspect: "CM visibility",       before: "Manual P&L",       after: "Live waterfall" },
              { aspect: "Anomaly detection",   before: "Discovered late",  after: "Auto-flagged" },
              { aspect: "Team alignment",      before: "Conflicting data", after: "Single source" },
            ],
          }}
        />
      )

    case "onboarding_preview":
      return (
        <OnboardingPreview
          data={{
            totalTime: "48 hours",
            steps: [
              { icon: "🔌", title: "Connect your stack",        description: "Shopify, Meta, Google, Klaviyo, 3PL — 100+ native connectors. No engineering required." },
              { icon: "⚙️", title: "Saras normalises your data", description: "Pre-built dbt models clean and join your data automatically. Zero manual mapping." },
              { icon: "🤖", title: "All 8 agents go live",       description: "Every domain agent activates with your real data. Invite your team immediately." },
            ],
          }}
        />
      )

    default:
      return null
  }
}
