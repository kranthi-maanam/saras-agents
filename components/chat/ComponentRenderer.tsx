import type { DemoComponentType } from "@/lib/demoTriggers"
import WaterfallChart from "@/components/chat/WaterfallChart"
import CohortHeatmap from "@/components/chat/CohortHeatmap"
import ChannelTable from "@/components/chat/ChannelTable"
import FlowDiagram from "@/components/chat/FlowDiagram"
import MetricCard from "@/components/chat/MetricCard"
import {
  CM_WATERFALL_DATA,
  COHORT_HEATMAP_DATA,
  MARKETING_CHANNEL_DATA,
  PIPELINES_FLOW_DATA,
  INVENTORY_METRIC_DATA,
} from "@/lib/demoData"

interface Props {
  type: DemoComponentType
}

export default function ComponentRenderer({ type }: Props) {
  switch (type) {
    case "cm_waterfall":
      return <WaterfallChart data={CM_WATERFALL_DATA} />
    case "cohort_heatmap":
      return <CohortHeatmap data={COHORT_HEATMAP_DATA} />
    case "marketing_channels":
      return <ChannelTable data={MARKETING_CHANNEL_DATA} />
    case "pipeline_flow":
      return <FlowDiagram data={PIPELINES_FLOW_DATA} />
    case "inventory_metrics":
      return <MetricCard data={INVENTORY_METRIC_DATA} />
    default:
      return null
  }
}
