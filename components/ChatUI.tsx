"use client"
import { useEffect, useRef, useState } from "react"
import {
  GitBranch, Database, DollarSign, Users, Megaphone,
  Package, Bot, Layers, ArrowLeft, Send
} from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"
import LeadModal from "@/components/LeadModal"
import type { Tile } from "@/lib/tiles"
import { getSuggestedTopics } from "@/lib/suggestedTopics"
import { scoreIntent } from "@/lib/intentScorer"

const ICON_MAP: Record<string, React.ElementType> = {
  GitBranch, Database, DollarSign, Users, Megaphone, Package, Bot, Layers,
}

interface Message {
  role: "user" | "assistant"
  content: string
}

interface Props {
  tile: Tile
  onBack: () => void
}

export default function ChatUI({ tile, onBack }: Props) {
  const Icon = ICON_MAP[tile.iconName] ?? Bot
  const suggestedTopics = getSuggestedTopics(tile.id)

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: tile.description },
  ])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [showTopics, setShowTopics] = useState(true)
  const [showBookingCTA, setShowBookingCTA] = useState(false)
  const [showLead, setShowLead] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streaming])

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return

    const userMessage: Message = { role: "user", content: text.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setShowTopics(false)
    setStreaming(true)

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
              updated[updated.length - 1] = {
                role: "assistant",
                content: accumulated,
              }
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

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--page-bg)" }}>
      {/* Header */}
      <header
        className="flex items-center gap-3 px-5 py-3 border-b flex-shrink-0"
        style={{ borderColor: "var(--divider)", background: "var(--card-bg)", backdropFilter: "var(--card-blur)" }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--text-2)" }}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="w-px h-4 mx-1" style={{ background: "var(--divider)" }} />

        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `rgba(0,168,120,0.15)`, border: `1px solid rgba(0,168,120,0.30)` }}
        >
          <Icon size={14} style={{ color: "#00a878" }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--text-1)" }}>
            {tile.title}
          </p>
          <p className="text-[11px] truncate" style={{ color: "var(--text-2)" }}>
            {tile.subtitle}
          </p>
        </div>

        <ThemeToggle />
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4 max-w-2xl w-full mx-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
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
              {streaming && i === messages.length - 1 && msg.role === "assistant" && (
                <span
                  className="inline-block w-1.5 h-3.5 ml-0.5 rounded-sm animate-pulse"
                  style={{ background: "var(--text-3)", verticalAlign: "middle" }}
                />
              )}
            </div>
          </div>
        ))}

        {/* Booking CTA */}
        {showBookingCTA && !showLead && (
          <div className="flex justify-start">
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
                border: "1px solid var(--card-border)",
                color: "var(--text-2)",
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        className="px-4 pb-5 pt-2 max-w-2xl w-full mx-auto"
      >
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
            placeholder="Ask anything…"
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
              background: "#00a878",
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
