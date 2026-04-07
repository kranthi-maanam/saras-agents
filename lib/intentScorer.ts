interface Message {
  role: "user" | "assistant"
  content: string
}
const HIGH_INTENT = [
  "pricing", "cost", "how much", "sign up", "get started", "trial",
  "connect", "integrate", "how do i", "can i see", "my data",
  "implementation", "onboarding", "account", "contract", "subscribe",
  "start", "demo", "free", "plan", "access", "setup", "ready",
  "let's do it", "want to", "show me", "next steps",
]
const LOW_INTENT = [
  "research", "curious", "just wondering", "not ready", "just browsing",
  "competitor", "roadmap", "future", "how does it work", "what is",
  "learning", "understanding", "explore", "comparing", "later",
]
export function scoreIntent(messages: Message[]): number {
  let score = 0
  const userMessages = messages
    .filter(m => m.role === "user")
    .map(m => m.content.toLowerCase())
  for (const msg of userMessages) {
    for (const kw of HIGH_INTENT) {
      if (msg.includes(kw)) score += 1
    }
    for (const kw of LOW_INTENT) {
      if (msg.includes(kw)) score -= 1
    }
  }
  const turnCount = userMessages.length
  if (turnCount >= 5) score += 1
  if (turnCount >= 8) score += 1
  const shortMessages = userMessages.filter(m => m.split(/\s+/).length <= 3).length
  score -= Math.floor(shortMessages / 2)
  return score
}
export function intentLabel(score: number): string {
  if (score >= 5) return "high: user is ready to convert"
  if (score >= 3) return "medium-high: user is considering"
  if (score >= 1) return "medium: user is engaged"
  return "low: user is exploring"
}