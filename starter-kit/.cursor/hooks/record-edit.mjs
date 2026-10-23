#!/usr/bin/env node
/**
 * afterFileEdit: append each edited path to a per-turn ledger
 * so the stop hook knows this turn changed files.
 */
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { stdin } from "node:process";

const hooksDir = dirname(fileURLToPath(import.meta.url));
const ledgerPath = join(hooksDir, ".edited-this-turn");
const projectRoot = join(hooksDir, "..", "..");

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

const filePath = input.file_path;
if (!filePath || typeof filePath !== "string") {
  process.stdout.write("{}\n");
  process.exit(0);
}

const rel = relative(projectRoot, filePath);
// Ignore edits outside the project and ledger/state files.
if (
  rel.startsWith("..") ||
  rel === ".cursor/hooks/.edited-this-turn" ||
  rel.endsWith("/.edited-this-turn")
) {
  process.stdout.write("{}\n");
  process.exit(0);
}

mkdirSync(hooksDir, { recursive: true });
appendFileSync(ledgerPath, `${rel || filePath}\n`);
process.stdout.write("{}\n");
