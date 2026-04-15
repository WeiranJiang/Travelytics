# Ask What Matters

**Adaptive AI for smarter travel reviews** — frontend prototype for the 2026 Wharton Hack-AI-thon (presented by Expedia).

The tool asks travelers 1–2 smart follow-up questions while they leave a review — targeted at specific information gaps on the property (stale amenities, contradictory ratings, renovation status, etc.) — to keep property listings current and reduce reviewer cognitive load.

## Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** — design tokens extracted from Expedia's live EGDS design system
- **Centra No2** (Expedia's primary font) + **Reckless XPD** loaded from Expedia's public CDN
- **Lucide** icons
- **Web Speech API** for in-browser voice input (no backend needed for voice)

All backend calls route through `src/api/client.ts`. Until the Node.js backend is ready, it returns mocks from `src/api/mock.ts`. See `HANDOFF.md` for how to wire up the real API.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:5173.

## Project structure

```
src/
  api/
    types.ts       # API contract — shared with backend
    client.ts      # The only file that talks to the backend
    mock.ts        # Fake data for local dev
  components/
    ui/            # Button, Card, StarRating, Badge, Avatar, ScoreBadge
    layout/        # Header (Expedia-style nav)
    property/      # PropertyHeader, RatingBreakdown, AmenityList, ReviewCard
    review/        # CategoryRatingsInput, SmartQuestion, VoiceInput, ImpactPreview
  pages/
    PropertyPage.tsx   # Listing view
    ReviewFlow.tsx     # Multi-step review submission
    ThankYou.tsx       # Before/after impact demo screen
  lib/voice.ts      # Web Speech API wrapper
  styles/           # Tailwind + Expedia fonts
```

## Design language

Tokens from the real Expedia EGDS (see `/Hackathon1/expedia_design_reference.md`):
- Navy `#191E3B`, action blue `#1668E3`, brand yellow `#FDDB32`
- Pill-shaped buttons (`rounded-full`), 16px card corners, 1px dividers `#DFE0E4`
- Gold rating stars `#FFB800`

## Deploy

Vercel picks this up automatically. `npm run build` outputs to `dist/`.

## Documentation

- `README.md` — this file
- `HANDOFF.md` — how to connect the Node.js backend (teammate)
- `../Hackathon1/expedia_design_reference.md` — full design token reference
