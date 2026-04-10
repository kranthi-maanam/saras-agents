"use client"
import { useState } from "react"
import { Copy, Mail, Check } from "lucide-react"

interface Props {
  insights: string[]
  visitorName?: string
  visitorEmail?: string
  visitorRole?: string
}

export default function InsightSummaryCard({ insights, visitorName, visitorEmail, visitorRole }: Props) {
  const [copied, setCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailSending, setEmailSending] = useState(false)

  function handleCopy() {
    const text = insights.map((ins, i) => `${i + 1}. ${ins}`).join("\n")
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleSendEmail() {
    if (emailSending || emailSent) return
    setEmailSending(true)
    try {
      await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: visitorEmail,
          name: visitorName,
          role: visitorRole,
          insights,
        }),
      })
      setEmailSent(true)
    } catch (err) {
      console.error("Failed to send summary:", err)
    } finally {
      setEmailSending(false)
    }
  }

  return (
    <div
      className="component-enter rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: "rgba(0,168,120,0.06)",
        border: "1px solid rgba(0,168,120,0.20)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
          style={{ background: "rgba(0,168,120,0.14)", border: "1px solid rgba(0,168,120,0.28)" }}
        >
          ✦
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
            Conversation Insights
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
            Key takeaways from your session with Saras AI
          </p>
        </div>
      </div>

      {/* Insight bullets */}
      <ul className="flex flex-col gap-2">
        {insights.map((ins, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
            <span
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
              style={{ background: "rgba(0,168,120,0.16)", color: "#00a878" }}
            >
              {i + 1}
            </span>
            <span style={{ color: "var(--text-2)" }}>{ins}</span>
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-opacity hover:opacity-80"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "var(--text-2)",
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy insights"}
        </button>

        {visitorEmail && (
          <button
            onClick={handleSendEmail}
            disabled={emailSending || emailSent}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-opacity hover:opacity-80"
            style={{
              background: emailSent ? "rgba(0,168,120,0.16)" : "#00a878",
              color: "#fff",
              opacity: emailSending ? 0.6 : 1,
              cursor: emailSent ? "default" : "pointer",
            }}
          >
            {emailSent ? <Check size={12} /> : <Mail size={12} />}
            {emailSent ? "Sent to your inbox!" : emailSending ? "Sending…" : "Send to my email"}
          </button>
        )}
      </div>
    </div>
  )
}
