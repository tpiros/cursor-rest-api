# Product browser UI

Small React (Vite + TypeScript) app that lists sample products from the parent REST API, with category and in-stock filters.

## Requirements

- Node.js 24+
- REST API running (from the repo root: `npm start` or `npm run dev`)

## Setup

```bash
cd ui
cp .env.example .env   # sets VITE_API_URL=http://localhost:3000
npm install
```

## Run

In one terminal (repo root):

```bash
npm run dev
```

In another (`ui/`):

```bash
npm run dev
```

Open the URL Vite prints (usually [http://localhost:5173](http://localhost:5173)).

## Test

```bash
cd ui
npm test
```

## Notes

- Catalog data comes from the API seed fixtures (made-up sample products).
- Change `VITE_API_URL` in `.env` if the API listens on another host/port.
- Restart `npm run dev` after changing `.env` — Vite only reads env files at startup.
- The API allows browser requests from other origins (CORS). You still need both processes running.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| “Missing VITE_API_URL…” | Copy `.env.example` to `.env` in `ui/`, then restart Vite. |
| “Could not reach the API…” | Start the API from the repo root (`npm run dev`) and confirm `VITE_API_URL` matches its host/port. |
| Empty list with filters | Clear category / uncheck “In stock only”, or confirm seed data includes that category. |
| Filters stay on “All” only | The first successful unfiltered load fills categories — fix connectivity first. |
