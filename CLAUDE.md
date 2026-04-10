# Claude Instructions

## Project
Saras Agent — Next.js 16 app (App Router, Turbopack, Tailwind CSS v4).
8 expert AI agents for e-commerce brands ($15M–$500M).

## Stack
- **Framework:** Next.js 16.2.2 with App Router
- **LLM:** Groq Llama 3.3 70B via `groq-sdk` (streamed SSE from `/api/chat`)
- **UI library:** `@openuidev/react-ui` + `@openuidev/react-lang` (OpenUI)
- **Icons:** `lucide-react`
- **Styling:** Tailwind CSS v4 + CSS custom properties in `app/globals.css`
- **Theme:** Light/dark via `.dark` class on `<html>`; tokens use `--openui-*` namespace

## Architecture
- `app/page.tsx` — home grid of 8 agent tiles + RoleModal + ChatUI
- `components/RoleModal.tsx` — name + role capture (both **mandatory**)
- `components/ChatUI.tsx` — streaming chat, demo triggers, email CTA timer
- `components/LeadModal.tsx` — email/lead capture form
- `components/chat/ComponentRenderer.tsx` — renders OpenUI-wrapped demo charts
- `lib/tiles.ts` — 8 agent tile definitions
- `lib/systemPrompt.ts` — role-aware LLM system prompts
- `lib/demoTriggers.ts` — keyword → demo component mapping
- `lib/intentScorer.ts` — intent scoring for booking CTA

## Key Behaviours
- **Session persistence:** Visitor name + role stored in `sessionStorage` (`saras_visitor_name`, `saras_visitor_role`). Modal is skipped if both are already set when user switches agents.
- **Mandatory fields:** RoleModal requires both full name and role before enabling Start.
- **2-minute email CTA:** Timer starts on first user message. After 120s shows sticky banner above input prompting email capture via LeadModal.
- **Demo components:** Keyword-triggered charts/tables wrapped in OpenUI `<Card>` with `<Tabs>` for multi-view and `<FollowUpBlock>` for suggested follow-ups.
- **Leads:** POST `/api/leads` → Google Sheets webhook (`GOOGLE_SHEETS_WEBHOOK_URL` env var).

## Dev
```bash
npm run dev      # starts on port 3000 (or next available)
npm run build
npm run lint
```

## Environment Variables
- `GROQ_API_KEY` — Groq LLM
- `GOOGLE_SHEETS_WEBHOOK_URL` — lead capture webhook
