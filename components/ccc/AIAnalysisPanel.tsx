"use client"

import { useState, useEffect, useRef } from "react"
import type { CccRecord, CccInteraction } from "@/lib/cccWriter"

type Customer = CccRecord & { id: string; created_at: string }
type Interaction = CccInteraction & { id: string; created_at: string }

const VIEW_LABELS: Record<string, string> = {
  all: "CEO",
  marketing: "Marketing (Sarath)",
  "pre-sales": "Pre-Sales (Balaji)",
  sales: "Sales (Balaji)",
  cs: "CS (Chai)",
  support: "Support",
  experience: "Product & Design",
  delivery: "Engineering",
}

interface AIAnalysisPanelProps {
  customer: Customer
  interactions: Interaction[]
  view?: string
  autoRun?: boolean
}

export function AIAnalysisPanel({ customer, interactions, view = "all", autoRun = true }: AIAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState("")
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState("")
  const [hasRun, setHasRun] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  async function runAnalysis(customQuestion?: string) {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    setLoading(true)
    setAnalysis("")
    setHasRun(true)

    try {
      const res = await fetch("/api/ccc-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, interactions, view, question: customQuestion }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) {
        setAnalysis("Unable to generate analysis. Check your Groq API key.")
        setLoading(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setAnalysis(accumulated)
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setAnalysis("Analysis failed — please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoRun) runAnalysis()
    return () => abortRef.current?.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer.id, view])

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--divider)] bg-[var(--openui-sunk)]">
        <div className="flex items-center gap-2">
          <span className="text-sm">✨</span>
          <span className="text-xs font-semibold text-[var(--text-1)]">AI Analysis</span>
          <span className="text-[10px] text-[var(--text-3)] px-1.5 py-0.5 rounded bg-[var(--openui-sunk-deep)]">
            {VIEW_LABELS[view] ?? view} lens
          </span>
        </div>
        {hasRun && !loading && (
          <button
            onClick={() => runAnalysis(question || undefined)}
            className="text-[11px] text-[var(--openui-text-brand)] hover:underline"
          >
            Refresh
          </button>
        )}
      </div>

      {/* Analysis output */}
      <div className="px-4 py-3 min-h-[80px]">
        {loading && !analysis && (
          <div className="flex items-center gap-2 text-[var(--text-3)]">
            <span className="animate-spin text-sm">⟳</span>
            <span className="text-xs">Analysing {customer.name ?? "customer"}…</span>
          </div>
        )}
        {analysis && (
          <p className="text-sm text-[var(--text-1)] leading-relaxed whitespace-pre-wrap">
            {analysis}
            {loading && <span className="inline-block w-1.5 h-4 bg-[var(--openui-text-brand)] ml-0.5 animate-pulse rounded-sm" />}
          </p>
        )}
        {!loading && !analysis && !hasRun && (
          <p className="text-xs text-[var(--text-3)]">Click "Ask AI" to generate analysis.</p>
        )}
      </div>

      {/* Custom question */}
      <div className="px-4 pb-3 flex gap-2">
        <input
          type="text"
          placeholder={`Ask anything about ${customer.name?.split(" ")[0] ?? "this customer"}…`}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && question.trim()) {
              runAnalysis(question.trim())
              setQuestion("")
            }
          }}
          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[var(--card-border)] bg-[var(--openui-sunk)] text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--openui-border-interactive)]"
        />
        <button
          onClick={() => { if (question.trim()) { runAnalysis(question.trim()); setQuestion("") } else runAnalysis() }}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--openui-interactive-accent-default)] text-white disabled:opacity-50 hover:bg-[var(--openui-interactive-accent-hover)] transition-colors"
        >
          {loading ? "…" : "Ask AI"}
        </button>
      </div>
    </div>
  )
}
