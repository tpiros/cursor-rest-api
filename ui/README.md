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
