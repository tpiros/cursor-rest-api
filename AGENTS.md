# Agent guide — rest-api

Node.js 24+ Express 5 ESM training API. In-memory data from `data/*.json`. No auth.

## Commands

```bash
npm install
npm run dev      # watch mode
npm start        # production-style
npm test         # Vitest
```

Default port `3000` (`PORT` overrides). Smoke: `curl http://localhost:3000/health`

Use **npm only** (not pnpm/yarn). Prefer **Vitest** for new tests.

## Conventions

- Errors: `{ "error": { "code": "...", "message": "..." } }` (`NOT_FOUND`, `VALIDATION_ERROR`, …).
- Keep `openapi.yaml` (and Postman when relevant) aligned with real routes.
- Prefer the smallest change that solves the request.
- Seed fixtures in `data/` are sample data; do not treat them as production customer records.
- Do not commit, push, deploy, or touch cloud accounts unless explicitly asked.

## Done when

If you changed `src/`, `routes/`, `tests/`, or `openapi.yaml`:

1. `npm test` passes
2. Error responses still use the envelope above
3. OpenAPI matches the behaviour you changed
4. You did not leave unused routers or dead endpoints undocumented
