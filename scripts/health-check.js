#!/usr/bin/env node

"use strict";

const dns = require("dns").promises;
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "domains", "_meta.json"), "utf8"));
const meta = raw._meta || raw;
const zones = meta.zones || [];

if (!zones.length) {
  console.error("health: no zones listed in domains/_meta.json");
  process.exit(1);
}

async function main() {
  let failed = false;

  for (const zone of zones) {
    try {
      const soa = await dns.resolveSoa(zone);
      console.log(`ok    ${zone}  SOA ${soa.nsname} (serial ${soa.serial})`);
    } catch (err) {
      failed = true;
      console.error(`down  ${zone}  ${err.code || err.message}`);
    }
  }

  if (failed) {
    process.exit(1);
  }
}

main();
