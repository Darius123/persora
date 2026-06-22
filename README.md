# Persora.

**AI predictions with receipts.**

Ask any prediction question. Three AI agents debate in parallel using **0G Compute**. A synthesizer weighs the arguments and delivers a verdict with a confidence score. The full reasoning chain is stored permanently on **0G Storage**. You get a shareable link — on-chain proof that never disappears.

🔗 **Live:** https://persora-flame.vercel.app

---

## How it works

1. User submits a prediction question (e.g. "Who will win the 2026 World Cup?")
2. Three agents run in parallel via **0G Compute** (OpenAI-compatible API):
   - **The Analyst** — data-driven, probabilistic reasoning
   - **The Skeptic** — challenges assumptions, finds weak points
   - **The Historian** — pattern matches against precedent
3. A synthesizer agent reads all three verdicts and produces:
   - A **pick** (specific entity: "Brazil", "YES", a company name, etc.)
   - A **consensus** (LIKELY / UNLIKELY / UNCERTAIN)
   - A **confidence score** (0–100%)
   - A **summary** of the reasoning
4. The full verdict JSON is uploaded to **0G Storage** and returns a permanent root hash
5. The hash becomes the shareable receipt URL: `/verdict/[hash]`

---

## 0G Integration

### Compute
All LLM inference runs through the 0G Compute network:
```
Endpoint: https://router-api.0g.ai/v1
Model: qwen2.5-omni (configurable via ZG_MODEL)
```
Every agent call uses `withRetry()` (3 attempts, exponential backoff) to handle testnet variability.

### Storage
Every verdict is permanently stored on-chain:
```typescript
import { ZgFile, Indexer } from "@0gfoundation/0g-storage-ts-sdk";
// Full reasoning chain uploaded → root hash returned → used as receipt ID
```
Storage is non-fatal — predictions still return even if the network is congested, with a deterministic fallback hash derived from the verdict content.

---

## Optional: Multi-model battle

Users can add Claude, ChatGPT, or Grok as extra debaters. The synthesizer weighs all inputs. More models = richer verdict.

---

## Tech stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS 4
- **0G Compute** — multi-agent LLM inference
- **0G Storage** — permanent on-chain verdict storage
- **Privy** — wallet authentication (supports EVM + Solana)
- **Ethers v6** — payment transaction signing
- **Framer Motion** — terminal-style animated UI

---

## Running locally

```bash
cp .env.local.example .env.local
# Fill in ZG_API_KEY, ZG_MODEL, ZG_PRIVATE_KEY, NEXT_PUBLIC_BASE_URL

npm install
npm run dev
```

### Required env vars

| Variable | Description |
|---|---|
| `ZG_API_KEY` | 0G Compute API key from pc.0g.ai |
| `ZG_MODEL` | Model ID (e.g. `qwen2.5-omni`) |
| `ZG_PRIVATE_KEY` | Wallet private key for 0G Storage signing |
| `NEXT_PUBLIC_BASE_URL` | Base URL for shareable receipt links |

---

## Key files

| File | Purpose |
|---|---|
| `src/lib/agents.ts` | Multi-agent research logic, synthesizer, withRetry |
| `src/lib/storage.ts` | 0G Storage upload + retrieve |
| `src/app/api/predict/route.ts` | POST /api/predict — runs agents, stores verdict |
| `src/app/predict/page.tsx` | Prediction terminal UI |
| `src/app/verdict/[hash]/page.tsx` | Shareable receipt page |

---

Built for the **0G Zero Cup** hackathon · June 2026
