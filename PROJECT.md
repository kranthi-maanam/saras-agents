# Saras Agent — Project Documentation

> 8 expert AI agents for e-commerce brands ($15M-$500M). A Next.js 16 app that simulates CXO-level domain specialists to engage prospective visitors on sarasanalytics.com.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.2 (App Router, Turbopack) |
| Language | TypeScript 5 |
| LLM | Groq (Llama 3.1 8B / Llama 3.3 70B / Gemma2 9B fallback chain) |
| UI Library | @openuidev/react-ui + @openuidev/react-lang |
| Icons | lucide-react |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Theme | Light/dark via `.dark` class; tokens use `--openui-*` namespace |
| Hosting | Vercel (Fluid Compute) |

---

## Directory Structure

```
saras-agent/
├── app/
│   ├── page.tsx                          # Home grid — 8 agent tiles + RoleModal + ChatUI
│   ├── layout.tsx                        # Root layout (fonts, theme script, metadata)
│   ├── globals.css                       # Tailwind v4 + CSS custom properties
│   └── api/
│       ├── chat/route.ts                 # Streaming chat (Groq SSE)
│       ├── leads/route.ts                # Lead capture → Google Sheets webhook
│       ├── book/route.ts                 # Sales booking → webhook
│       └── summary/route.ts              # Conversation summary → webhook
│
├── components/
│   ├── ChatUI.tsx                        # Main chat interface (6 agents)
│   ├── DemoView.tsx                      # Split-pane chat + dashboard (CM agent)
│   ├── RoleModal.tsx                     # Name + role + email capture
│   ├── LeadModal.tsx                     # Email/lead capture form
│   ├── ThemeToggle.tsx                   # Dark/light mode switcher
│   ├── TileIllustration.tsx              # Tile visual decorations
│   └── chat/
│       ├── ComponentRenderer.tsx         # Routes to correct demo component
│       ├── WaterfallChart.tsx            # CM waterfall visualization
│       ├── CohortHeatmap.tsx             # Retention cohort heatmap
│       ├── ChannelTable.tsx              # Marketing channel performance
│       ├── FlowDiagram.tsx               # Data pipeline health
│       ├── MetricCard.tsx                # Inventory/metrics display
│       ├── InsightCard.tsx               # Single insight callout
│       ├── InsightSummaryCard.tsx         # End-of-conversation summary
│       ├── ComparisonTable.tsx           # Before/after comparison
│       ├── SignupCTA.tsx                 # Call-to-action card
│       ├── OnboardingPreview.tsx         # 3-step onboarding preview
│       ├── SalesBooking.tsx              # Sales calendar booking
│       └── cm/                           # Contribution Margin specific
│           ├── CMChannelTable.tsx
│           ├── CMWaterfall.tsx
│           ├── CartCombinations.tsx
│           ├── CohortComparison.tsx
│           ├── DiscountLeakage.tsx
│           ├── ProfitabilitySimulator.tsx
│           └── WeeklyTrend.tsx
│
├── lib/
│   ├── tiles.ts                          # 8 agent tile definitions
│   ├── systemPrompt.ts                   # 4-phase conversation engine
│   ├── cxoContext.ts                     # Market data, benchmarks, agent personas
│   ├── intentScorer.ts                   # Intent detection for booking CTA
│   ├── demoTriggers.ts                   # Keyword → demo component mapping
│   ├── brewingMessages.ts                # Domain-specific loading messages
│   ├── componentData.ts                  # Component configuration data
│   ├── demoData.ts                       # Sample data for visualizations
│   └── suggestedTopics.ts                # Follow-up topic suggestions
│
├── package.json
├── tsconfig.json
├── postcss.config.js
├── next.config.ts
└── CLAUDE.md                             # AI assistant instructions
```

---

## The 8 Domain Agents

| # | Agent ID | Title | Persona |
|---|----------|-------|---------|
| 1 | `pipelines` | Pipelines | CTO / VP Data Engineering |
| 2 | `data-warehousing` | Data Warehousing | VP Analytics / Head of BI |
| 3 | `contribution-margin` | Contribution Margin | CFO / SVP Finance |
| 4 | `cohorts` | Cohorts | Head of Ecommerce / VP Retention |
| 5 | `marketing-sales` | Marketing & Sales Analytics | CMO / VP Growth |
| 6 | `inventory-planning` | Product & Inventory Planning | COO / VP Supply Chain |
| 7 | `saras-iq` | Saras iQ | Head of Analytics / VP Data Science |
| 8 | `saras-agent` | Saras Agent | Fractional CEO / Board Advisor |

Each agent has a deep persona with domain-specific benchmarks, diagnostic questions, proof points, and pain points defined in `lib/cxoContext.ts`.

---

## Architecture

### User Flow

```
Landing Page (8 tiles)
    │
    ├── Click tile → RoleModal (name + role + email)
    │                    │
    │                    ├── contribution-margin → DemoView (split-pane + dashboard)
    │                    └── all others → ChatUI
    │
    ├── Session restored? → Skip modal, go straight to chat
    │
    └── Chat Flow:
         ├── Auto-send "__begin__" → Phase 1 AI opener
         ├── User message → POST /api/chat → Groq SSE stream
         ├── Keyword detection → inject demo component
         ├── Intent scoring → show booking CTA (score >= 3)
         ├── 2-minute timer → email capture banner
         ├── Turn 7+ → insight summary or signup CTA
         └── Turn 20 → hard cap with summary card
```

### Conversation Phases

| Phase | Turns | Goal | Style |
|-------|-------|------|-------|
| **Arrival** | 1 | Greet, establish context, ask 1 question | 2-3 sentences, no pitch |
| **Topic Entry** | 2-3 | Go from broad context into specific pain | 3-5 sentences, 1 benchmark |
| **Discovery Depth** | 4-7 | Probe company profile, stack, urgency | 3-5 sentences, reference earlier context |
| **Handoff** | 8+ | Synthesize + offer next step | 2 paths: self-serve or team call |

### Streaming Chat Architecture

```
Client (ChatUI)                    Server (/api/chat)                  Groq API
     │                                   │                                │
     ├── POST {messages, tileId, ...} ──►│                                │
     │                                   ├── Build system prompt          │
     │                                   ├── Try model cascade ──────────►│
     │                                   │   (8B → 70B → 9B on 429)      │
     │                                   │                                │
     │   ◄── SSE: data: "token" ────────│◄── stream chunk ──────────────│
     │   ◄── SSE: data: "token" ────────│◄── stream chunk ──────────────│
     │   ◄── SSE: data: [DONE] ────────│                                │
     │                                   │                                │
     ├── detectDemoTrigger() ───► inject component                       │
     └── scoreIntent() ──────► show CTA if score >= 3                   │
```

Key optimizations:
- **Direct streaming** — tokens flow from Groq to client with zero buffering
- **`maxRetries: 0`** — Groq SDK auto-retry disabled; instant model fallback on 429
- **`X-Accel-Buffering: no`** — prevents Vercel proxy from buffering SSE
- **`maxDuration: 30`** — explicit Vercel function timeout
- **Lazy Groq singleton** — module-level client reused across requests

---

## API Routes

### `POST /api/chat`
Streaming chat endpoint. Returns Server-Sent Events.

**Request:**
```json
{
  "messages": [{"role": "user", "content": "..."}],
  "tileId": "pipelines",
  "tileTitle": "Pipelines",
  "visitorName": "John",
  "visitorRole": "CFO / Finance Lead"
}
```

**Response:** SSE stream
```
data: "Hello"
data: " John"
data: ", welcome."
data: [DONE]
```

**Model fallback:** `llama-3.1-8b-instant` → `llama-3.3-70b-versatile` → `gemma2-9b-it`

### `POST /api/leads`
Captures lead info → Google Sheets webhook.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@brand.com",
  "company": "Acme Inc",
  "revenueRange": "$15M-$50M",
  "tileId": "contribution-margin"
}
```

### `POST /api/book`
Saves sales booking request → webhook.

### `POST /api/summary`
Saves conversation summary (insights, takeaways) → webhook.

---

## Demo Components

Components are injected into chat via keyword triggers or AI-driven SSE events.

| Component | Trigger Keywords | Description |
|-----------|-----------------|-------------|
| `waterfall_chart` | margin, COGS, waterfall, P&L | CM waterfall: revenue → deductions → net margin |
| `cohort_heatmap` | retention, cohort, repeat, LTV | Month-over-month cohort retention grid |
| `channel_table` | ROAS, CAC, attribution, channel | Marketing channel performance matrix |
| `flow_diagram` | pipeline, connector, sync, ETL | Data pipeline health visualization |
| `metric_card` | stockout, reorder, inventory, SKU | Inventory metrics display |
| `insight_card` | insight, anomaly, alert | Single insight highlight |
| `comparison_table` | before/after, comparison | Workflow comparison |
| `signup_cta` | pricing, demo, sign up, trial | Call-to-action card |
| `insight_summary` | (auto at turn 7+ or 20) | End-of-conversation summary |
| `onboarding_preview` | onboarding, setup, get started | 3-step onboarding flow |

---

## Intent Scoring & CTAs

**Intent signals** (from `lib/intentScorer.ts`):
- Keywords: pricing, demo, trial, signup, book, schedule, next steps, get started, contact
- Score accumulates based on keyword matches, conversation length, and message patterns
- Score >= 3 → "Book a call with the team" CTA appears

**Timed CTAs:**
- **2-minute email banner** — after 120s of real interaction, prompts email capture
- **Turn 7+ card** — high-intent visitors get `signup_cta`, others get `insight_summary`
- **Turn 20 hard cap** — conversation ends with `insight_summary`

---

## Session Persistence

| Key | Storage | Purpose |
|-----|---------|---------|
| `saras_visitor_name` | sessionStorage | Skip RoleModal on agent switch |
| `saras_visitor_role` | sessionStorage | Tailor system prompt to role |
| `saras_visitor_email` | sessionStorage | Pre-fill lead forms |

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `GROQ_API_KEY` | Yes | Groq LLM API access |
| `GOOGLE_SHEETS_WEBHOOK_URL` | No | Lead/booking/summary webhook |

---

## Development

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev

# Production build
npm run build

# Lint
npm run lint
```

---

## Dependencies

### Production
| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.2.2 | App framework (App Router + Turbopack) |
| react / react-dom | 19.2.4 | UI library |
| groq-sdk | ^1.1.2 | LLM API client (Llama models) |
| @openuidev/react-ui | ^0.11.0 | UI component library |
| @openuidev/react-lang | ^0.2.0 | Internationalization utilities |
| lucide-react | ^1.7.0 | Icon library |
| @anthropic-ai/sdk | ^0.82.0 | Anthropic SDK (available but not primary) |
| @tsparticles/react | ^3.0.0 | Particle effects |
| @tsparticles/slim | ^3.9.1 | Particle engine (slim bundle) |

### Dev
| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | ^4 | Utility-first CSS |
| @tailwindcss/postcss | ^4 | PostCSS plugin |
| typescript | ^5 | Type checking |
| eslint / eslint-config-next | ^9 / 16.2.2 | Linting |

---

## Deployment (Vercel)

- **Production URL:** https://saras-agents.vercel.app
- **Auto-deploy:** Push to `main` triggers production build
- **Build time:** ~30-35s
- **Function runtime:** Node.js (Fluid Compute), `maxDuration: 30s`
- **Env vars:** `GROQ_API_KEY` (Production only — add to Preview/Development too)

---

## Key Design Decisions

1. **Plain text LLM responses** — no JSON wrapping. Enables true token-by-token streaming without buffering.
2. **Client-side component detection** — `detectDemoTrigger()` matches keywords locally instead of relying on LLM-generated component JSON.
3. **Model cascade, not retry** — on Groq rate limits (429), instantly falls to next model instead of waiting with exponential backoff.
4. **4-phase conversation design** — structured progression from greeting → discovery → handoff prevents premature selling.
5. **Role-aware prompting** — system prompt adapts vocabulary and priorities to visitor's role (CFO sees P&L language, CMO sees ROAS/CAC).
6. **Contribution Margin agent** gets special treatment with `DemoView` (split-pane + external dashboard iframe).
