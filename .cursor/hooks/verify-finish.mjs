#!/usr/bin/env node
/**
 * On agent stop: if API-related files are dirty, remind once per dirty-set
 * to run npm test / check OpenAPI. Re-nags only when that set of paths changes.
 */
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stdin } from "node:process";

const statePath = join(
  dirname(fileURLToPath(import.meta.url)),
  ".verify-dirty-hash",
);

async function readStdin() {
  const chunks = [];
  for await (const chunk of stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

const raw = await readStdin();
let input = {};
try {
  input = JSON.parse(raw || "{}");
} catch {
  process.stdout.write("{}\n");
  process.exit(0);
}

if (input.status !== "completed" || (input.loop_count ?? 0) > 0) {
  process.stdout.write("{}\n");
  process.exit(0);
}

let porcelain = "";
try {
  porcelain = execSync("git status --porcelain", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
} catch {
  process.stdout.write("{}\n");
  process.exit(0);
}

const relevant = porcelain
  .split("\n")
  .map((line) => line.slice(3).trim().split(" -> ").pop())
  .filter((path) =>
    /^(src\/|routes\/|tests\/|openapi\.yaml|package\.json|AGENTS\.md)/.test(
      path,
    ),
  )
  .sort();

if (relevant.length === 0) {
  process.stdout.write("{}\n");
  process.exit(0);
}

const hash = createHash("sha1").update(relevant.join("\n")).digest("hex");
mkdirSync(dirname(statePath), { recursive: true });
if (existsSync(statePath) && readFileSync(statePath, "utf8").trim() === hash) {
  process.stdout.write("{}\n");
  process.exit(0);
}

writeFileSync(statePath, `${hash}\n`);

process.stdout.write(
  `${JSON.stringify({
    followup_message:
      "API-related files still have uncommitted changes (" +
      relevant.slice(0, 8).join(", ") +
      "). Before finishing: run `npm test`, confirm error envelopes and openapi.yaml match, then reply briefly that verification is done (or fix failures).",
  })}\n`,
);
