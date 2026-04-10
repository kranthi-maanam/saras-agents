"use client"
import { useEffect, useRef, useState } from "react"
import {
  GitBranch, Database, DollarSign, Users, Megaphone,
  Package, Bot, Layers, ArrowLeft, Send, PanelRightClose, PanelRight
} from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"
import LeadModal from "@/components/LeadModal"
import ComponentRenderer from "@/components/chat/ComponentRenderer"
import type { Tile } from "@/lib/tiles"
import { scoreIntent } from "@/lib/intentScorer"
import { detectDemoTrigger, mapAIComponentType, type DemoComponentType } from "@/lib/demoTriggers"
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

const DASHBOARD_URL = "https://cm-atomic-profitability-iq.netlify.app/"

const HIGH_INTENT_KEYWORDS = [
  "pricing", "price", "cost", "how much", "contract", "demo", "trial",
  "get started", "sign up", "signup", "onboard", "implementation", "timeline",
  "next steps", "buy", "purchase", "subscribe",
]

const MAX_TURNS = 20

type Message = { role: "user" | "assistant"; content: string }

interface Props {
  tile: Tile
  onBack: () => void
  visitorName: string
  visitorEmail: string
  visitorRole: string
}

export default function DemoView({ tile, onBack, visitorName, visitorEmail, visitorRole }: Props) {
  const Icon = ICON_MAP[tile.iconName] ?? Bot
  const accentColor = DOMAIN_COLORS[tile.id] ?? "#00a878"

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [showBookingCTA, setShowBookingCTA] = useState(false)
  const [showLead, setShowLead] = useState(false)
  const [brewingIndex, setBrewingIndex] = useState(0)
  const [demoComponents, setDemoComponents] = useState<Map<number, DemoComponentType>>(new Map())
  const [conversationInsights, setConversationInsights] = useState<string[]>([])
  const [chatCollapsed, setChatCollapsed] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const brewingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoOpenedRef = useRef(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streaming, demoComponents])

  // Auto-send silent "begin" message on mount
  useEffect(() => {
    if (autoOpenedRef.current) return
    autoOpenedRef.current = true
    sendMessage("__begin__", true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  async function sendMessage(text: string, silent = false) {
    if (streaming) return
    if (!silent && !text.trim()) return

    const trigger = silent ? null : detectDemoTrigger(tile.id, text)

    const userTurnText = silent
      ? `You are opening a conversation with a visitor${visitorName ? ` named ${visitorName}` : ""}${visitorRole ? ` who is a ${visitorRole}` : ""} who just selected the "${tile.title}" domain. They are looking at a live Atomic Profitability dashboard showing contribution margin data (CM1, CM2, CM3) across channels. This is Phase 1 — Arrival. Reference what they're seeing on the dashboard, surface the core pain for their role, and ask ONE sharp diagnostic question. 2–3 sentences max. No product pitch.`
      : text.trim()

    const userMessage: Message = { role: "user", content: userTurnText }
    const newMessages = silent ? [] : [...messages, { role: "user", content: text.trim() } as Message]
    const apiMessages = silent ? [userMessage] : [...messages, userMessage]

    if (!silent) {
      setMessages(newMessages)
      setInput("")
    }
    setStreaming(true)

    const assistantMsgIndex = newMessages.length
    const assistantMessage: Message = { role: "assistant", content: "" }
    setMessages((prev) => (silent ? [...prev, assistantMessage] : [...newMessages, assistantMessage]))

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
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
      let sseComponent: DemoComponentType | null = null

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
            const parsed = JSON.parse(payload)
            if (parsed && typeof parsed === "object" && "component" in parsed && parsed.component) {
              const mapped = mapAIComponentType(parsed.component.type ?? "")
              if (mapped) sseComponent = mapped
            } else if (typeof parsed === "string") {
              accumulated += parsed
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: "assistant", content: accumulated }
                return updated
              })
            }
          } catch {
            // skip malformed chunk
          }
        }
      }

      const displayedMessages = silent
        ? [...messages, { role: "assistant" as const, content: accumulated }]
        : [...newMessages, { role: "assistant" as const, content: accumulated }]
      setMessages(displayedMessages)

      const componentToShow = sseComponent ?? trigger
      if (componentToShow !== null) {
        const idx = silent ? 0 : assistantMsgIndex
        setDemoComponents((prev) => new Map(prev).set(idx, componentToShow))
      }

      if (!silent) {
        const userTurnCount = displayedMessages.filter((m) => m.role === "user").length
        const score = scoreIntent(displayedMessages)
        if (score >= 3) setShowBookingCTA(true)

        if (userTurnCount >= 7 && !demoComponents.has(-1)) {
          const allText = displayedMessages.map((m) => m.content).join(" ").toLowerCase()
          const isHighIntent = HIGH_INTENT_KEYWORDS.some((kw) => allText.includes(kw))
          const endComponent: DemoComponentType = isHighIntent ? "signup_cta" : "insight_summary"
          setDemoComponents((prev) => new Map(prev).set(-1, endComponent))
          const insights = displayedMessages
            .filter((m) => m.role === "assistant" && m.content.length > 40)
            .slice(-5)
            .map((m) => m.content.slice(0, 120).trim())
          setConversationInsights(insights)
        }

        if (userTurnCount >= MAX_TURNS && !demoComponents.has(-2)) {
          setDemoComponents((prev) => new Map(prev).set(-2, "insight_summary"))
          const insights = displayedMessages
            .filter((m) => m.role === "assistant" && m.content.length > 40)
            .slice(-5)
            .map((m) => m.content.slice(0, 120).trim())
          setConversationInsights(insights)
        }
      }
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

  const userTurnCount = messages.filter((m) => m.role === "user").length
  const isMaxTurnsReached = userTurnCount >= MAX_TURNS
  const brewingMessages = BREWING_MESSAGES[tile.id] ?? DEFAULT_BREWING
  const currentBrewingMsg = brewingMessages[brewingIndex % brewingMessages.length]

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!isMaxTurnsReached) sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--page-bg)" }}>
      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: "var(--divider)", background: "var(--card-bg)", backdropFilter: "var(--card-blur)" }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70 flex-shrink-0"
          style={{ color: "var(--text-2)" }}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="w-px h-4 mx-1 flex-shrink-0" style={{ background: "var(--divider)" }} />

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

      {/* Split pane: Dashboard + Chat */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Pane — Dashboard */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${chatCollapsed ? "" : "border-r"}`}
          style={{ borderColor: "var(--divider)" }}
        >
          {/* Dashboard sub-header */}
          <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: "var(--divider)" }}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--text-3)" }}>
                Preview
              </span>
              <div className="flex items-center gap-1.5 ml-3">
                {["Shopify", "Amazon", "TikTok"].map((src) => (
                  <span
                    key={src}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ background: `${accentColor}12`, color: accentColor, border: `1px solid ${accentColor}25` }}
                  >
                    {src}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: "var(--text-3)" }}>
                Atomic Profitability Tracker
              </span>
            </div>
          </div>

          {/* Iframe */}
          <iframe
            src={DASHBOARD_URL}
            className="flex-1 w-full border-0"
            title="Atomic Profitability Dashboard"
            allow="clipboard-read; clipboard-write"
          />
        </div>

        {/* Right Pane — Chat Sidebar */}
        <div
          className={`flex flex-col transition-all duration-300 overflow-hidden ${chatCollapsed ? "w-0" : "w-[380px] min-w-[320px]"}`}
          style={{ background: "var(--page-bg)" }}
        >
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "var(--divider)" }}>
            <span className="text-xs font-semibold" style={{ color: "var(--text-1)" }}>Conversation</span>
            <button
              onClick={() => setChatCollapsed(true)}
              className="p-1 rounded-md transition-opacity hover:opacity-70"
              style={{ color: "var(--text-3)" }}
              title="Collapse chat"
            >
              <PanelRightClose size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mr-2 mt-0.5"
                      style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}40`, color: accentColor }}
                    >
                      S
                    </div>
                  )}
                  <div
                    className="max-w-[90%] rounded-2xl px-3 py-2.5 text-[13px] leading-relaxed"
                    style={
                      msg.role === "user"
                        ? { background: accentColor, color: "#fff" }
                        : {
                            background: "var(--card-bg)",
                            border: `1px solid ${accentColor}25`,
                            color: "var(--text-1)",
                            backdropFilter: "var(--card-blur)",
                          }
                    }
                  >
                    {msg.content}
                    {streaming && i === messages.length - 1 && msg.role === "assistant" && msg.content && (
                      <span
                        className="inline-block w-1.5 h-3 ml-0.5 rounded-sm animate-pulse"
                        style={{ background: "var(--text-3)", verticalAlign: "middle" }}
                      />
                    )}
                  </div>
                </div>

                {/* Demo component below assistant message */}
                {msg.role === "assistant" && demoComponents.has(i) && (
                  <div className="ml-8 mt-2 component-enter">
                    <ComponentRenderer
                      type={demoComponents.get(i)!}
                      visitorName={visitorName}
                      visitorEmail={visitorEmail}
                      visitorRole={visitorRole}
                      insights={conversationInsights}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Brewing state */}
            {streaming && (
              <div className="flex items-center gap-2 ml-8">
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
                <span className="text-[10px] italic" style={{ color: "var(--text-3)" }}>
                  {currentBrewingMsg}
                </span>
              </div>
            )}

            {/* Booking CTA */}
            {showBookingCTA && !showLead && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={() => setShowLead(true)}
                  className="rounded-xl px-3 py-2 text-xs font-semibold transition-opacity hover:opacity-90"
                  style={{ background: accentColor, color: "#fff" }}
                >
                  Book a call →
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-1">
            <div
              className="flex items-end gap-2 rounded-2xl px-3 py-2.5"
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
                placeholder={isMaxTurnsReached ? "Conversation limit reached" : "Ask anything…"}
                disabled={streaming || isMaxTurnsReached}
                className="flex-1 resize-none bg-transparent text-[13px] outline-none leading-relaxed"
                style={{ color: "var(--text-1)", maxHeight: "80px", overflowY: "auto" }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={streaming || !input.trim() || isMaxTurnsReached}
                className="flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-opacity"
                style={{
                  background: accentColor,
                  opacity: streaming || !input.trim() || isMaxTurnsReached ? 0.4 : 1,
                }}
              >
                <Send size={12} color="#fff" />
              </button>
            </div>
          </div>
        </div>

        {/* Collapse/expand toggle (visible when chat is collapsed) */}
        {chatCollapsed && (
          <button
            onClick={() => setChatCollapsed(false)}
            className="absolute right-4 top-[72px] z-10 p-2 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", color: "var(--text-2)" }}
            title="Open chat"
          >
            <PanelRight size={18} />
          </button>
        )}
      </div>

      {/* Lead Modal */}
      {showLead && (
        <LeadModal
          tile={tile}
          onClose={() => setShowLead(false)}
        />
      )}
    </div>
  )
}
