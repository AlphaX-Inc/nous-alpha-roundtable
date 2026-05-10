# Nous Alpha — Roundtable (standalone)

Single-screen Vercel deployment of **Screen 4** from the PayPay × Nous Alpha prototype: an AI investment-committee roundtable rendered inside an iPhone 17 Pro mockup, with 11 named expert personas (Aschenbrenner, Simons, Griffin, Dalio, Druckenmiller, Marks, Burry, Tudor Jones, Munger, Dimon, Klarman) each backed by a specific Claude Code subagent.

## What this repo is

Just the frontend for the Roundtable screen. Static HTML + in-browser JSX transpilation (Babel). No build step. Drop on Vercel and it serves directly.

The full deck and the multi-agent backend live in [`AlphaX-Inc/paypay-nous-alpha`](https://github.com/AlphaX-Inc/paypay-nous-alpha).

## What you can do here

- **JP / EN language toggle** — flips every label, persona quote, stance pill, and chip.
- **Auto-rotation** of the active speaker, then stops once each persona has been shown once. Tap any avatar to pin a speaker.
- **Ask the table** — bottom-sheet input where the user types a motion (or taps a trending chip) and 11 agents deliberate.
- **Live decision panel** — verdict, vote tally, suggested sleeve rebalance (PP-INC / PP-DIV / PP-BND / PP-GLD), rebalance ¥, projected uplift — all derived from the agents' actual votes.
- **Comparison motions** ("NVDA vs INTC") — agents return picks, the panel adapts to show a pick board instead of sleeve allocations.
- **Sleeve detail sheet** — tap any sleeve card to see full holdings, target yield, vol, max DD, and Sharpe.

## Backend

Frontend reads `window.NOUS_BACKEND_URL`:

- `localhost` / `127.0.0.1` → `http://localhost:3001`
- otherwise → the Railway domain hardcoded in `index.html` (placeholder until you fill it in)

If the backend is unreachable the page falls back to in-file demo data and still renders.

The matching backend is in [`paypay-nous-alpha/backend/`](https://github.com/AlphaX-Inc/paypay-nous-alpha/tree/main/backend) and deploys to Railway.

## Run locally

```bash
python3 -m http.server 5500
# open http://localhost:5500
```

(or any static server)

## Deploy on Vercel

This repo has `vercel.json` configured for static-only serving. Import on Vercel:

1. **Add New Project** → import this repo.
2. **Framework Preset**: Other.
3. **Root Directory**: `./` (default).
4. **Build Command** / **Output Directory**: leave empty.
5. **Deploy**.

After deploy, edit the placeholder Railway URL in `index.html` to point at your backend, push, and Vercel auto-redeploys.
