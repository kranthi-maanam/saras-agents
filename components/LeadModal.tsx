"use client"
import { useState } from "react"
import type { Tile } from "@/lib/tiles"

interface Props {
  tile: Tile
  onClose: () => void
}

export default function LeadModal({ tile, onClose }: Props) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [revenue, setRevenue] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          revenue,
          tileId: tile.id,
          tileTitle: tile.title,
        }),
      })
      setDone(true)
      setTimeout(onClose, 1800)
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-7"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          boxShadow: "var(--shadow-hover)",
          backdropFilter: "var(--card-blur)",
        }}
      >
        {done ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-3">✓</div>
            <p className="text-sm font-medium" style={{ color: "#00a878" }}>
              You're in. We'll be in touch shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: "#00a878" }}>
                Book a call
              </p>
              <h2 className="text-base font-semibold" style={{ color: "var(--text-1)" }}>
                Talk to a Saras expert
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--text-2)" }}>
                Get a 20-min walkthrough of {tile.title} for your brand.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                required
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{
                  background: "var(--card-hover-bg)",
                  border: "1px solid var(--card-border)",
                  color: "var(--text-1)",
                }}
              />
              <input
                required
                type="email"
                placeholder="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{
                  background: "var(--card-hover-bg)",
                  border: "1px solid var(--card-border)",
                  color: "var(--text-1)",
                }}
              />
              <input
                type="text"
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{
                  background: "var(--card-hover-bg)",
                  border: "1px solid var(--card-border)",
                  color: "var(--text-1)",
                }}
              />
              <select
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{
                  background: "var(--card-hover-bg)",
                  border: "1px solid var(--card-border)",
                  color: revenue ? "var(--text-1)" : "var(--text-3)",
                }}
              >
                <option value="" disabled>Annual revenue range</option>
                <option value="$15M–$50M">$15M–$50M</option>
                <option value="$50M–$200M">$50M–$200M</option>
                <option value="$200M+">$200M+</option>
              </select>

              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors"
                  style={{
                    background: "var(--card-hover-bg)",
                    border: "1px solid var(--card-border)",
                    color: "var(--text-2)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-opacity"
                  style={{
                    background: "#00a878",
                    color: "#fff",
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? "Sending…" : "Book a call →"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
