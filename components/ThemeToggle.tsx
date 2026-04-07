"use client"
import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
export default function ThemeToggle() {
  const [dark, setDark] = useState(true)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.classList.contains("dark"))
  }, [])
  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }
  if (!mounted) return null
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 cursor-pointer"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        color: "var(--text-2)",
        boxShadow: "var(--shadow)",
      }}
    >
      {dark
        ? <Sun size={13} strokeWidth={1.8} />
        : <Moon size={13} strokeWidth={1.8} />
      }
    </button>
  )
}