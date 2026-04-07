"use client"
import { useState } from "react"
import {
  GitBranch, Database, DollarSign, Users, Megaphone,
  Package, Bot, Layers,
} from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"
import ChatUI from "@/components/ChatUI"
import RoleModal from "@/components/RoleModal"
import { tiles, type Tile } from "@/lib/tiles"

const ICON_MAP: Record<string, React.ElementType> = {
  GitBranch, Database, DollarSign, Users, Megaphone, Package, Bot, Layers,
}

// Domain accent colors matching the live site
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

// Grid positions: [colStart, colEnd, rowStart, rowEnd]
const GRID_POS: Record<string, [number, number, number, number]> = {
  "pipelines":            [1, 3, 1, 2],
  "data-warehousing":     [3, 4, 1, 2],
  "contribution-margin":  [4, 5, 1, 3],
  "cohorts":              [1, 2, 2, 3],
  "marketing-sales":      [2, 3, 2, 3],
  "inventory-planning":   [3, 4, 2, 3],
  "saras-iq":             [1, 3, 3, 4],
  "saras-agent":          [3, 5, 3, 4],
}

// Wide tiles (span 2+ columns) use horizontal layout
const WIDE_TILES = new Set(["pipelines", "saras-iq", "saras-agent"])
// Tall tile (spans all rows) uses vertical layout
const TALL_TILES = new Set(["contribution-margin"])

function LiveBadge() {
  return (
    <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{ background: "rgba(0,168,120,0.12)", color: "#00a878", border: "1px solid rgba(0,168,120,0.20)" }}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#00a878] animate-pulse" />
      Live
    </div>
  )
}

function TileCard({ tile, onClick }: { tile: Tile; onClick: () => void }) {
  const Icon = ICON_MAP[tile.iconName] ?? Bot
  const color = DOMAIN_COLORS[tile.id] ?? "#00a878"
  const [cs, ce, rs, re] = GRID_POS[tile.id] ?? [1, 2, 1, 2]
  const isWide = WIDE_TILES.has(tile.id)
  const isTall = TALL_TILES.has(tile.id)

  return (
    <button
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden text-left transition-all duration-200 cursor-pointer"
      style={{
        gridColumnStart: cs,
        gridColumnEnd: ce,
        gridRowStart: rs,
        gridRowEnd: re,
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--shadow)",
        backdropFilter: "var(--card-blur)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.background = "var(--card-hover-bg)"
        el.style.borderColor = "var(--card-hover-border)"
        el.style.boxShadow = "var(--shadow-hover)"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = "var(--card-bg)"
        el.style.borderColor = "var(--card-border)"
        el.style.boxShadow = "var(--shadow)"
      }}
    >
      {/* Top gradient line on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      {/* Glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 60% 50% at 30% 30%, ${color}18, transparent 70%)` }}
      />

      <div className={`relative h-full p-5 flex ${isWide ? "flex-row gap-5" : "flex-col"} ${isTall ? "justify-between" : ""}`}>
        {/* Left / Top section */}
        <div className={`flex flex-col gap-2.5 ${isWide ? "w-[48%] flex-shrink-0 justify-between" : "flex-1"}`}>
          <div>
            {/* Icon badge */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center mb-3"
              style={{
                background: `${color}20`,
                border: `1px solid ${color}38`,
              }}
            >
              <Icon size={14} style={{ color }} />
            </div>

            {/* Subtitle */}
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color }}>
              {tile.subtitle}
            </p>

            {/* Title */}
            <h3 className="text-sm font-semibold leading-snug" style={{ color: "var(--text-1)" }}>
              {tile.title}
            </h3>
          </div>

          {/* Description (for single or tall tiles) */}
          {!isWide && (
            <p
              className="text-xs leading-relaxed"
              style={{
                color: "var(--text-2)",
                display: "-webkit-box",
                WebkitLineClamp: isTall ? 6 : 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {tile.description}
            </p>
          )}

          {/* Contribution Margin role metadata */}
          {tile.id === "contribution-margin" && (
            <>
              <div className="w-full h-px my-1" style={{ background: "var(--divider)" }} />
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                CFO · SVP Finance
              </p>
            </>
          )}

          {/* CTA */}
          <p
            className="text-xs font-medium translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200"
            style={{ color }}
          >
            Experience it →
          </p>
        </div>

        {/* Right section for wide tiles */}
        {isWide && (
          <div className="flex flex-col justify-end flex-1">
            <p
              className="text-xs leading-relaxed"
              style={{
                color: "var(--text-2)",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {tile.description}
            </p>
          </div>
        )}
      </div>
    </button>
  )
}

export default function Home() {
  const [activeTile, setActiveTile] = useState<Tile | null>(null)
  const [pendingTile, setPendingTile] = useState<Tile | null>(null)
  const [visitorName, setVisitorName] = useState("")
  const [visitorRole, setVisitorRole] = useState("")

  if (activeTile) {
    return (
      <ChatUI
        tile={activeTile}
        onBack={() => {
          setActiveTile(null)
          setVisitorName("")
          setVisitorRole("")
        }}
        visitorName={visitorName}
        visitorRole={visitorRole}
      />
    )
  }

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: "var(--page-bg-gradient, var(--page-bg))" }}
    >
      {/* Top glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-60"
        style={{
          background: "radial-gradient(ellipse 60% 80% at 50% 0%, var(--top-glow), transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-5 pb-0 max-w-screen-xl w-full mx-auto">
        <span className="text-sm font-semibold" style={{ color: "var(--text-1)", fontFamily: "var(--font-heading)" }}>
          Saras AI
        </span>
        <div className="flex items-center gap-3">
          <LiveBadge />
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-10 pb-8 max-w-2xl mx-auto">
        <h1
          className="font-semibold leading-tight mb-3"
          style={{
            fontSize: "clamp(26px, 4vw, 40px)",
            color: "var(--hero-title)",
            fontFamily: "var(--font-heading)",
          }}
        >
          Saras AI for E-Commerce Brands
        </h1>
        <p
          className="mb-2"
          style={{ fontSize: "clamp(14px, 2vw, 18px)", color: "var(--hero-sub)" }}
        >
          8 expert agents. One commerce intelligence platform.
        </p>
        <p
          style={{ fontSize: "clamp(11px, 1.5vw, 13px)", color: "var(--hero-desc)" }}
        >
          Each agent is a CXO-level specialist built for $15M–$500M brands.
          Pick a domain below to begin.
        </p>
      </section>

      {/* Tile grid */}
      <section className="relative z-10 flex-1 px-4 pb-6 max-w-screen-xl w-full mx-auto">
        <div
          className="grid gap-2.5"
          style={{ gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(3, minmax(140px, 1fr))" }}
        >
          {tiles.map((tile) => (
            <TileCard key={tile.id} tile={tile} onClick={() => setPendingTile(tile)} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-between px-6 py-4 max-w-screen-xl w-full mx-auto">
        <span className="text-[11px]" style={{ color: "var(--footer)" }}>
          Saras AI · sarasanalytics.com
        </span>
        <span className="hidden md:block text-[11px]" style={{ color: "var(--footer)" }}>
          Trusted by Ridge · True Classic · HexClad · Faherty · BPN · Athletic Greens
        </span>
      </footer>

      {/* Role selection modal */}
      {pendingTile && (
        <RoleModal
          tile={pendingTile}
          onStart={(name, role) => {
            setVisitorName(name)
            setVisitorRole(role)
            setActiveTile(pendingTile)
            setPendingTile(null)
          }}
          onClose={() => setPendingTile(null)}
        />
      )}
    </main>
  )
}
