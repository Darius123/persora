# Persora

**Tagline:** AI predictions with receipts.
**Hackathon:** 0G Zero Cup — deadline June 23, 2026
**Stack:** Next.js 15, Tailwind CSS 4, TypeScript, 0G Compute (LLM inference), 0G Storage

## What it does

Users ask a prediction question ("Will X happen by Y?"). Three AI agents (The Analyst, The Skeptic, The Historian) research in parallel using 0G Compute. A synthesizer produces a final verdict with a confidence score. The full reasoning chain is stored permanently on 0G Storage. The user gets a shareable link with on-chain proof.

## 0G Integration

- **Compute:** OpenAI-compatible API at `https://router-api.0g.ai/v1` — set `ZG_API_KEY` from pc.0g.ai
- **Storage:** `@0gfoundation/0g-storage-ts-sdk` — needs `ZG_PRIVATE_KEY` (wallet private key) and testnet ETH

## Key files

- `src/lib/agents.ts` — multi-agent research logic + synthesizer
- `src/lib/storage.ts` — 0G Storage upload/retrieve
- `src/app/api/predict/route.ts` — POST /api/predict endpoint
- `src/app/page.tsx` — main UI

## Env vars

Copy `.env.local.example` to `.env.local` and fill in:
- `ZG_API_KEY` — 0G Compute API key
- `ZG_MODEL` — model to use (check pc.0g.ai for available models)
- `ZG_PRIVATE_KEY` — wallet private key for 0G Storage signing
- `NEXT_PUBLIC_BASE_URL` — base URL for share links

## Design system

- Background: #000000
- Text: #ffffff primary, #888 secondary, #444 muted
- Card: #0d0d0d with border #1a1a1a
- Font: system sans-serif, heavy weight for headings
- The period is a brand element — appears in logo and wordmark
- No color accents — pure monochrome

## Dev

```bash
npm run dev   # http://localhost:3000
npm run build
```
