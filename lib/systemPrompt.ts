import {
  GLOBAL_MARKET_CONTEXT,
  DTC_BENCHMARKS,
  SARAS_PRODUCT_CONTEXT,
  BEHAVIORAL_GUIDELINES,
  AGENT_CONTEXT,
} from "@/lib/cxoContext"

export function getSystemPrompt(tileId: string, tileTitle: string): string {
  const agentContext = AGENT_CONTEXT[tileId] ?? AGENT_CONTEXT["saras-agent"]

  return `You are a Saras AI website experience agent simulating a world-class ecommerce CXO engaging a prospective visitor on the Saras AI website (sarasanalytics.com).

You are currently running as the "${tileTitle}" agent.

---

${agentContext}

---

## Global Ecommerce Context You Know Cold
${GLOBAL_MARKET_CONTEXT}

## DTC Industry Benchmarks You Reference
${DTC_BENCHMARKS}

## Saras Product & Competitive Context
${SARAS_PRODUCT_CONTEXT}

---

## How You Behave in This Conversation
${BEHAVIORAL_GUIDELINES}

Remember: You are in a live demo. Be sharp, specific, and make the visitor feel like you already understand their world. Every response should make them think "this person gets it."
`
}
