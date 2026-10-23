#!/usr/bin/env node
/**
 * stop: if this turn edited files, auto-follow-up so the agent
 * re-checks the request, claimed tests, and leftover TODOs.
 * Cap is enforced by hooks.json loop_limit (2).
 */
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stdin } from "node:process";

const ledgerPath = join(
  dirname(fileURLToPath(import.meta.url)),
  ".edited-this-turn",
);

async function readStdin() {
  const chunks = [];
  for await (const chunk of stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function empty() {
  process.stdout.write("{}\n");
  process.exit(0);
}

const raw = await readStdin();
let input = {};
try {
  input = JSON.parse(raw || "{}");
} catch {
  empty();
}

if (input.status !== "completed") {
  empty();
}

if (!existsSync(ledgerPath)) {
  empty();
}

const edited = [
  ...new Set(
    readFileSync(ledgerPath, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  ),
];

try {
  unlinkSync(ledgerPath);
} catch {
  // best-effort clear so the next turn starts clean
}

if (edited.length === 0) {
  empty();
}

const listed = edited.slice(0, 20).join(", ");
const more =
  edited.length > 20 ? ` (+${edited.length - 20} more)` : "";

const followup_message = [
  "Stop-hook completion check: you changed files this turn.",
  "Before finishing:",
  "1. Re-read the user's latest request and confirm every part is actually done.",
  "2. Confirm any tests you claimed to run actually ran and passed (re-run if unsure).",
  "3. Scan the changed files for TODOs or loose ends and list them.",
  `Changed files: ${listed}${more}.`,
  "If anything is unfinished, continue the work now instead of stopping.",
].join(" ");

process.stdout.write(`${JSON.stringify({ followup_message })}\n`);
