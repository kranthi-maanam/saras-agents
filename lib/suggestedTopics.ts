export const SUGGESTED_TOPICS: Record<string, string[]> = {
  "pipelines": [
    "How many connectors do you support?",
    "What happens when an API breaks?",
    "How does your ETL cost compare to Fivetran?",
    "Can you handle Amazon Seller Central data?",
    "How often does data refresh?",
  ],
  "data-warehousing": [
    "How long does month-end close take with Saras?",
    "Do you work with Snowflake and BigQuery?",
    "What does a unified data model look like?",
    "How do you handle Shopify vs. Amazon revenue differently?",
    "How long does implementation take?",
  ],
  "contribution-margin": [
    "Show me the full CM breakdown",
    "Which channel is most profitable?",
    "How do promos affect my margin?",
    "New vs. returning customer profitability",
    "Which product combos drive the most CM?",
    "Help me simulate margin improvements",
  ],
  "cohorts": [
    "How do I read a cohort heatmap?",
    "What's a healthy Month-6 retention rate?",
    "How do Black Friday cohorts compare to organic?",
    "Can I segment cohorts by acquisition channel?",
    "How do subscription customers compare to one-time buyers?",
  ],
  "marketing-sales": [
    "Why is platform ROAS misleading?",
    "How do you measure incrementality?",
    "Can I see blended CAC across all channels?",
    "How do you split new vs. returning customer revenue?",
    "What's a good LTV:CAC ratio for my vertical?",
  ],
  "inventory-planning": [
    "How accurate is your demand forecasting?",
    "Can you flag stockouts before they happen?",
    "How do you handle Amazon FBA restock limits?",
    "How do you connect marketing plans to supply chain?",
    "What does $500K in saved write-offs look like?",
  ],
  "saras-iq": [
    "How is this different from ChatGPT for my data?",
    "Can it answer questions about last week's margin?",
    "How does anomaly detection work?",
    "Does it work on our existing warehouse?",
    "How long to get up and running?",
  ],
  "saras-agent": [
    "What does the full platform stack look like?",
    "How do brands like Ridge use Saras?",
    "What's the ROI on a data infrastructure investment?",
    "How does Era 3 commerce intelligence differ from BI?",
    "Where should a $50M brand start?",
  ],
}
export function getSuggestedTopics(tileId: string): string[] {
  return SUGGESTED_TOPICS[tileId] ?? SUGGESTED_TOPICS["saras-agent"]
}