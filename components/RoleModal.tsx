"use client"
import { useState } from "react"
import type { Tile } from "@/lib/tiles"

const ROLES = [
  "CMO / Growth Lead",
  "CFO / Finance Lead",
  "CEO / Founder",
  "Head of Data & Analytics",
  "VP Ecommerce",
  "Head of Retention",
  "Head of Supply Chain",
  "Just Exploring",
]

// Domain accent colors per tile
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

interface Props {
  tile: Tile
  onStart: (name: string, role: string) => void
  onClose: () => void
}

export default function RoleModal({ tile, onStart, onClose }: Props) {
  const [name, setName] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const accentColor = DOMAIN_COLORS[tile.id] ?? "#00a878"

  function handleStart() {
    if (!selectedRole) return
    onStart(name.trim(), selectedRole)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(12px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 relative"
        style={{
          background: "rgba(15,15,18,0.96)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.50)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-sm transition-opacity hover:opacity-70"
          style={{ color: "rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.06)" }}
        >
          ✕
        </button>

        {/* Tile badge */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center mb-4"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
        >
          <span className="text-base">👤</span>
        </div>

        <h2 className="text-base font-semibold mb-1" style={{ color: "rgba(255,255,255,0.90)" }}>
          Who should I talk to?
        </h2>
        <p className="text-[12px] mb-5" style={{ color: "rgba(255,255,255,0.38)" }}>
          I&apos;ll tailor the conversation to your role and priorities.
        </p>

        {/* Name input */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full rounded-xl px-3 py-2.5 text-sm mb-4 outline-none"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "rgba(255,255,255,0.85)",
          }}
        />

        {/* Role grid */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {ROLES.map((role) => {
            const isSelected = selectedRole === role
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className="rounded-xl px-3 py-2.5 text-left text-[12px] font-medium transition-all duration-150"
                style={{
                  background: isSelected ? `${accentColor}18` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isSelected ? accentColor : "rgba(255,255,255,0.08)"}`,
                  color: isSelected ? accentColor : "rgba(255,255,255,0.60)",
                  boxShadow: isSelected ? `0 0 12px ${accentColor}22` : "none",
                }}
              >
                {role}
              </button>
            )
          })}
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={!selectedRole}
          className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-150"
          style={{
            background: selectedRole ? accentColor : "rgba(255,255,255,0.06)",
            color: selectedRole ? "#fff" : "rgba(255,255,255,0.25)",
            cursor: selectedRole ? "pointer" : "not-allowed",
          }}
        >
          Start conversation →
        </button>
      </div>
    </div>
  )
}
