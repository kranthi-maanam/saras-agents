import Link from "next/link"
import ThemeToggle from "@/components/ThemeToggle"
import { CCCHelpGuide } from "@/components/ccc/CCCHelpGuide"

export default function CCCLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--page-bg)" }}>
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-[var(--divider)] backdrop-blur-md bg-[var(--card-bg)]/80">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors"
            >
              ← Home
            </Link>
            <div className="h-4 w-px bg-[var(--divider)]" />
            <Link
              href="/ccc"
              className="text-sm font-semibold text-[var(--text-1)] flex items-center gap-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              CCC
            </Link>
            <span className="text-[11px] text-[var(--text-3)] hidden sm:inline">Collective Customer Consciousness</span>
          </div>

          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/ccc" className="text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors text-xs">
                Customers
              </Link>
              <Link href="/ccc/live" className="text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors text-xs">
                Live Feed
              </Link>
            </nav>
            <div className="h-4 w-px bg-[var(--divider)]" />
            <CCCHelpGuide />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
