# Agent guide — <PROJECT_NAME>

One short paragraph: what this repo is, runtime/stack, and anything agents must not assume (auth, persistence, real customer data, etc.).

## Commands

```bash
npm install
npm run dev
npm start
npm test
```

Note the default port, env vars agents may need, and a one-line smoke check (`curl`, health route, etc.).

State package manager policy (e.g. npm only) and preferred test runner.

## Conventions

- Error / response shapes the agent must preserve
- Docs that must stay in sync with code (OpenAPI, README, Postman, …)
- Change-size preference (smallest safe diff, no drive-by refactors)
- Data-handling: fixtures vs production records; never invent real PII
- Do not commit, push, deploy, or touch cloud accounts unless explicitly asked

## Done when

List the checks that must pass before the agent stops after changing code, for example:

1. Tests for the touched area pass
2. Public contracts / docs match behaviour
3. No undocumented dead endpoints or unused modules left behind
