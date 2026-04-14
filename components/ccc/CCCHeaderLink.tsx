"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function CCCHeaderLink() {
  const pathname = usePathname()
  const isActive = pathname?.startsWith("/ccc")

  return (
    <Link
      href="/ccc"
      className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
        isActive
          ? "text-[var(--openui-text-brand)]"
          : "text-[var(--text-2)] hover:text-[var(--text-1)]"
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      CCC
    </Link>
  )
}
