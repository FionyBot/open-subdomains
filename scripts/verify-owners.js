#!/usr/bin/env node

"use strict";

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DOMAINS_DIR = path.join(ROOT, "domains");

function fail(message) {
  console.error(`verify-owners: ${message}`);
  process.exit(1);
}

const prAuthor = process.env.PR_AUTHOR;
if (!prAuthor) {
  console.log("verify-owners: PR_AUTHOR not set, not a pull request, skipping");
  process.exit(0);
}

/** Metadata and schema files are never registry entries. */
const RESERVED_FILENAMES = new Set(["_meta.json", "_example.json", "SCHEMA.json"]);

/** Files changed by this PR against the base branch, limited to domains/. */
function changedFiles() {
  const base = process.env.GITHUB_BASE_REF || "main";
  let output;
  try {
    // execFileSync, not a shell string: GITHUB_BASE_REF comes from the event.
    output = execFileSync(
      "git",
      ["diff", "--name-only", "--diff-filter=ACMR", `origin/${base}...HEAD`, "--", "domains"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    );
  } catch {
    // Local runs and shallow clones: fall back to every file in domains/.
    console.log("verify-owners: could not diff against the base branch, checking all files");
    output = fs
      .readdirSync(DOMAINS_DIR)
      .filter((f) => f.endsWith(".json") && !RESERVED_FILENAMES.has(f))
      .map((f) => path.join("domains", f))
      .join("\n");
  }
  return output
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.endsWith(".json") && !RESERVED_FILENAMES.has(path.basename(l)));
}

const files = changedFiles();
if (files.length === 0) {
  console.log("verify-owners: no registry files changed by this PR");
  process.exit(0);
}

const author = prAuthor.toLowerCase();
const mismatches = [];

for (const file of files) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) continue;
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (err) {
    // Malformed JSON is validate.js's job to report.
    console.log(`verify-owners: ${file}: unparseable, leaving it to the validator`);
    continue;
  }
  const entries = Array.isArray(parsed) ? parsed : [parsed];
  for (const entry of entries) {
    if (typeof entry.owner !== "string" || entry.owner.length === 0) continue;
    const owner = entry.owner.toLowerCase();
    if (owner !== author) {
      mismatches.push(`${file}: owner "${entry.owner}" does not match the PR author "${prAuthor}"`);
    }
  }
}

if (mismatches.length > 0) {
  console.error("verify-owners: every entry must be owned by the person opening the PR.\n");
  mismatches.forEach((m) => console.error(`  - ${m}`));
  console.error(
    `\nIf you are claiming this subdomain for someone else, ask them to open the PR ` +
      `themselves, or set "owner" to your own username.`
  );
  process.exit(1);
}

console.log(`verify-owners: ${files.length} file(s) verified against PR author "${prAuthor}"`);
