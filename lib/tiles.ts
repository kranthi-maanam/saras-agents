export interface Tile {
  id: string
  title: string
  subtitle: string
  description: string
  iconName: string
  gradient: string
  border: string
}
export const tiles: Tile[] = [
  {
    id: "pipelines",
    title: "Pipelines",
    subtitle: "Data Integration & ETL",
    description: "I see you're dealing with data pipeline complexity — broken connectors, schema drift, and rising ETL costs.",
    iconName: "GitBranch",
    gradient: "from-emerald-500/20 to-teal-600/10",
    border: "border-emerald-500/30",
  },
  {
    id: "data-warehousing",
    title: "Data Warehousing",
    subtitle: "Single Source of Truth",
    description: "Most $50M ecom brands are sitting on fragmented warehouse data that no one fully trusts.",
    iconName: "Database",
    gradient: "from-blue-500/20 to-indigo-600/10",
    border: "border-blue-500/30",
  },
  {
    id: "contribution-margin",
    title: "Contribution Margin",
    subtitle: "True Profitability",
    description: "Your real margin isn't what your P&L says — it's revenue minus ads, shipping, returns, fees, and fulfillment.",
    iconName: "DollarSign",
    gradient: "from-violet-500/20 to-purple-600/10",
    border: "border-violet-500/30",
  },
  {
    id: "cohorts",
    title: "Cohorts",
    subtitle: "Customer Lifetime Value",
    description: "Do you know which customer cohorts are actually profitable — not just in month one, but by month six and twelve?",
    iconName: "Users",
    gradient: "from-orange-500/20 to-amber-600/10",
    border: "border-orange-500/30",
  },
  {
    id: "marketing-sales",
    title: "Marketing & Sales Analytics",
    subtitle: "Real ROAS & Attribution",
    description: "Are you measuring ROAS or real revenue impact? Platform-reported numbers claim 2–3x more than actually exists.",
    iconName: "Megaphone",
    gradient: "from-pink-500/20 to-rose-600/10",
    border: "border-pink-500/30",
  },
  {
    id: "inventory-planning",
    title: "Product & Inventory Planning",
    subtitle: "Demand Forecasting",
    description: "Stockouts and overstock are both margin killers — carrying costs alone can hit 50% of annual OpEx.",
    iconName: "Package",
    gradient: "from-cyan-500/20 to-sky-600/10",
    border: "border-cyan-500/30",
  },
  {
    id: "saras-iq",
    title: "Saras iQ",
    subtitle: "AI Data Analyst",
    description: "What if your analyst worked 24/7, never missed context, and answered questions in seconds — not days?",
    iconName: "Bot",
    gradient: "from-red-500/20 to-rose-600/10",
    border: "border-red-500/30",
  },
  {
    id: "saras-agent",
    title: "Saras Agent",
    subtitle: "Commerce Intelligence",
    description: "Let me show you what an always-on commerce intelligence agent looks like for a brand at your stage.",
    iconName: "Layers",
    gradient: "from-yellow-500/20 to-lime-600/10",
    border: "border-yellow-500/30",
  },
]