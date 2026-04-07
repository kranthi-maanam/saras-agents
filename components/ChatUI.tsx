"use client"
import { useEffect, useRef, useState } from "react"
import {
  GitBranch, Database, DollarSign, Users, Megaphone,
  Package, Bot, Layers, ArrowLeft, Send
} from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"
import LeadModal from "@/components/LeadModal"
import ComponentRenderer from "@/components/chat/ComponentRenderer"
import type { Tile } from "@/lib/tiles"
import { getSuggestedTopics } from "@/lib/suggestedTopics"
import { scoreIntent } from "@/lib/intentScorer"
import { detectDemoTrigger, type DemoComponentType } from "@/lib/demoTriggers"
import { BREWING_MESSAGES, DEFAULT_BREWING } from "@/lib/brewingMessages"

const ICON_MAP: Record<string, React.ElementType> = {
  GitBranch, Database, DollarSign, Users, Megaphone, Package, Bot, Layers,
}

const DOMAIN_COLORS: Record<string, string> = {
  "pipelines":            "#10b981",
  "data-warehousing":     "#6366f1",
  "contribution-margin":  "#8b5cf6",
  "cohorts":              "#f59e0b",
  "marketing-sales":      "#ec4899",
  "inventory-planning":   "#06b6d4",
  "saras-iq":             "#ef4444",
  "saras-agent":          "#84cc16",
}

// Role-aware input placeholders per tile
const ROLE_PLACEHOLDERS: Record<string, Record<string, string>> = {
  "contribution-margin": {
    "CFO / Finance Lead":    "Ask about your CM waterfall or P&L breakdown...",
    "CEO / Founder":         "Ask how to improve contribution margin...",
    "CMO / Growth Lead":     "Ask about marketing spend vs CM impact...",
    "default":               "Ask about margin, COGS, or profitability...",
  },
  "cohorts": {
    "Head of Retention":     "Ask about repeat purchase rates or LTV...",
    "CMO / Growth Lead":     "Ask about cohort LTV by acquisition channel...",
    "CFO / Finance Lead":    "Ask about 12-month predicted LTV...",
    "default":               "Ask about retention, cohorts, or LTV...",
  },
  "marketing-sales": {
    "CMO / Growth Lead":     "Ask about ROAS, CAC, or channel attribution...",
    "CFO / Finance Lead":    "Ask about blended ROAS vs contribution margin...",
    "CEO / Founder":         "Ask how to lower CAC payback period...",
    "default":               "Ask about channel performance or attribution...",
  },
  "pipelines": {
    "Head of Data & Analytics": "Ask about pipeline health or connector status...",
    "default":               "Ask about data sync, connectors, or pipeline...",
  },
  "inventory-planning": {
    "Head of Supply Chain":  "Ask about stockout risk or reorder points...",
    "VP Ecommerce":          "Ask about sell-through rates or inventory turns...",
    "default":               "Ask about inventory, SKUs, or demand planning...",
  },
}

interface Message {
  role: "user" | "assistant"
  content: string
}

interface Props {
  tile: Tile
  onBack: () => void
  visitorName?: string
  visitorRole?: string
}

export default function ChatUI({ tile, onBack, visitorName, visitorRole }: Props) {
  const Icon = ICON_MAP[tile.iconName] ?? Bot
  const accentColor = DOMAIN_COLORS[tile.id] ?? "#00a878"
  const suggestedTopics = getSuggestedTopics(tile.id)

  const greeting = visitorName
    ? `Hi ${visitorName}! ${tile.description}`
    : tile.description

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: greeting },
  ])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [showTopics, setShowTopics] = useState(true)
  const [showBookingCTA, setShowBookingCTA] = useState(false)
  const [showLead, setShowLead] = useState(false)
  const [brewingIndex, setBrewingIndex] = useState(0)
  const [demoComponents, setDemoComponents] = useState<Map<number, DemoComponentType>>(new Map())

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const brewingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streaming, demoComponents])

  // Brewing message cycling
  useEffect(() => {
    if (streaming) {
      const msgs = BREWING_MESSAGES[tile.id] ?? DEFAULT_BREWING
      brewingRef.current = setInterval(() => {
        setBrewingIndex((prev) => (prev + 1) % msgs.length)
      }, 1800)
    } else {
      if (brewingRef.current) {
        clearInterval(brewingRef.current)
        brewingRef.current = null
      }
      setBrewingIndex(0)
    }
    return () => {
      if (brewingRef.current) clearInterval(brewingRef.current)
    }
  }, [streaming, tile.id])

  // Input placeholder based on role
  function getPlaceholder(): string {
    const tilePlaceholders = ROLE_PLACEHOLDERS[tile.id]
    if (!tilePlaceholders) return "Ask anything…"
    if (visitorRole && tilePlaceholders[visitorRole]) return tilePlaceholders[visitorRole]
    return tilePlaceholders["default"] ?? "Ask anything…"
  }

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return

    // Detect demo trigger BEFORE sending
    const trigger = detectDemoTrigger(tile.id, text)

    const userMessage: Message = { role: "user", content: text.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setShowTopics(false)
    setStreaming(true)

    const assistantMsgIndex = newMessages.length // index of the upcoming assistant message

    const assistantMessage: Message = { role: "assistant", content: "" }
    setMessages([...newMessages, assistantMessage])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          tileId: tile.id,
          tileTitle: tile.title,
          visitorName,
          visitorRole,
        }),
      })

      if (!res.body) throw new Error("No stream")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const payload = line.slice(6)
          if (payload === "[DONE]") break
          try {
            const token = JSON.parse(payload)
            accumulated += token
            setMessages((prev) => {
              const updated = [...prev]
              updated[updated.length - 1] = { role: "assistant", content: accumulated }
              return updated
            })
          } catch {
            // skip malformed chunk
          }
        }
      }

      const finalMessages: Message[] = [
        ...newMessages,
        { role: "assistant", content: accumulated },
      ]
      setMessages(finalMessages)

      // Inject demo component if trigger matched
      if (trigger !== null) {
        setDemoComponents((prev) => new Map(prev).set(assistantMsgIndex, trigger))
      }

      // Intent scoring
      const score = scoreIntent(finalMessages)
      if (score >= 3) setShowBookingCTA(true)
    } catch (err) {
      console.error("Chat error:", err)
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const brewingMessages = BREWING_MESSAGES[tile.id] ?? DEFAULT_BREWING
  const currentBrewingMsg = brewingMessages[brewingIndex % brewingMessages.length]

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--page-bg)" }}>
      {/* Header */}
      <header
        className="flex items-center gap-3 px-5 py-3 border-b flex-shrink-0"
        style={{ borderColor: "var(--divider)", background: "var(--card-bg)", backdropFilter: "var(--card-blur)" }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70 flex-shrink-0"
          style={{ color: "var(--text-2)" }}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="w-px h-4 mx-1 flex-shrink-0" style={{ background: "var(--divider)" }} />

        {/* Icon + title */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
        >
          <Icon size={14} style={{ color: accentColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--text-1)" }}>
            {tile.title}
          </p>
          <p className="text-[11px] truncate" style={{ color: "var(--text-2)" }}>
            {tile.subtitle}
            {visitorRole && (
              <span className="ml-2" style={{ color: accentColor, opacity: 0.7 }}>· {visitorRole}</span>
            )}
          </p>
        </div>

        {/* Live badge */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium flex-shrink-0"
          style={{ background: "rgba(0,168,120,0.10)", color: "#00a878", border: "1px solid rgba(0,168,120,0.20)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00a878] animate-pulse" />
          Live Demo
        </div>

        <ThemeToggle />
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4 max-w-2xl w-full mx-auto">
        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {/* Agent avatar */}
              {msg.role === "assistant" && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mr-2 mt-0.5"
                  style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}40`, color: accentColor }}
                >
                  S
                </div>
              )}
              <div
                className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={
                  msg.role === "user"
                    ? { background: "#00a878", color: "#fff" }
                    : {
                        background: "var(--card-bg)",
                        border: "1px solid var(--card-border)",
                        color: "var(--text-1)",
                        backdropFilter: "var(--card-blur)",
                      }
                }
              >
                {msg.content}
                {streaming && i === messages.length - 1 && msg.role === "assistant" && msg.content && (
                  <span
                    className="inline-block w-1.5 h-3.5 ml-0.5 rounded-sm animate-pulse"
                    style={{ background: "var(--text-3)", verticalAlign: "middle" }}
                  />
                )}
              </div>
            </div>

            {/* Demo component injected below assistant message */}
            {msg.role === "assistant" && demoComponents.has(i) && (
              <div className="ml-9 mt-3">
                <ComponentRenderer type={demoComponents.get(i)!} />
              </div>
            )}
          </div>
        ))}

        {/* Brewing state */}
        {streaming && (
          <div className="flex items-center gap-2 ml-9">
            <div className="flex gap-1 items-center">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{
                    backgroundColor: accentColor,
                    animation: `bounce 1.2s ease-in-out ${dot * 0.2}s infinite`,
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>
            <span className="text-[11px] italic" style={{ color: "var(--text-3)" }}>
              {currentBrewingMsg}
            </span>
          </div>
        )}

        {/* Booking CTA */}
        {showBookingCTA && !showLead && (
          <div className="flex justify-start ml-9">
            <button
              onClick={() => setShowLead(true)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "#00a878", color: "#fff" }}
            >
              Book a call with the team →
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested topics */}
      {showTopics && (
        <div className="px-4 pb-2 max-w-2xl w-full mx-auto flex flex-wrap gap-2">
          {suggestedTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => sendMessage(topic)}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80"
              style={{
                background: "var(--card-bg)",
                border: `1px solid ${accentColor}30`,
                color: "var(--text-2)",
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-5 pt-2 max-w-2xl w-full mx-auto">
        <div
          className="flex items-end gap-2 rounded-2xl px-4 py-3"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            backdropFilter: "var(--card-blur)",
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            disabled={streaming}
            className="flex-1 resize-none bg-transparent text-sm outline-none leading-relaxed"
            style={{
              color: "var(--text-1)",
              maxHeight: "120px",
              overflowY: "auto",
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={streaming || !input.trim()}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-opacity"
            style={{
              background: accentColor,
              opacity: streaming || !input.trim() ? 0.4 : 1,
            }}
          >
            <Send size={14} color="#fff" />
          </button>
        </div>
      </div>

      {/* Lead modal */}
      {showLead && (
        <LeadModal tile={tile} onClose={() => setShowLead(false)} />
      )}
    </div>
  )
}
