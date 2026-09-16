#!/usr/bin/env node
/* ══════════════════════════════════════════════════
   make-vault.mjs
   Turns people.json (private, never committed) into
   site/data/vault.json (public, safe to commit).

     node tools/make-vault.mjs            build the vault
     node tools/make-vault.mjs --codes    just print the code list

   The published vault contains ONLY: one salt, and one
   {iv, ct} blob per person. No names. No roles. No hints.
   Nothing to read in View Source.
   ══════════════════════════════════════════════════ */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { pbkdf2Sync, randomBytes, createCipheriv } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, '..');

const PEOPLE = join(SITE, 'people.json');
const OUT    = join(SITE, 'data', 'vault.json');

const ITERATIONS = 1_000_000;   // must match CONFIG.kdfIterations in app.js
const KEYLEN     = 32;          // AES-256

/* ─────────── code generation ─────────── */
const STOP = new Set(['de', 'van', 'den', 'der', 'du', 'le', 'la']);

function letterSeed(name) {
  const first = String(name).trim().split(/\s+/).filter(w => !STOP.has(w.toLowerCase()))[0] || String(name);
  const clean = first.normalize('NFD').replace(/[^a-zA-Z]/g, '').toUpperCase();
  return (clean + 'XXX').slice(0, 3);
}

function assignCodes(people) {
  const taken = new Set(people.filter(p => p.code).map(p => normCode(p.code)));
  return people.map(p => {
    if (p.code) return { ...p, code: normCode(p.code) };

    const letters = letterSeed(p.name);
    let code = null;
    // try each digit in a shuffled order until one is free
    for (const d of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      const c = letters + d;
      if (!taken.has(c)) { code = c; break; }
    }
    if (!code) throw new Error(`Could not assign a code for "${p.name}" — too many name collisions, set one by hand.`);
    taken.add(code);
    return { ...p, code };
  });
}

const normCode = s => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');

function shuffle(a) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0] % (i + 1);
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

/* ─────────── main ─────────── */
if (!existsSync(PEOPLE)) {
  console.error(`\n  No people.json found at:\n    ${PEOPLE}\n\n  Copy people.example.json to people.json and fill it in.\n`);
  process.exit(1);
}

let raw;
try {
  raw = JSON.parse(readFileSync(PEOPLE, 'utf8'));
} catch (e) {
  console.error(`\n  people.json isn't valid JSON: ${e.message}\n`);
  process.exit(1);
}

const list = Array.isArray(raw) ? raw : raw.people;
if (!Array.isArray(list) || !list.length) {
  console.error('\n  people.json should be an array of { name, message, code? }.\n');
  process.exit(1);
}

for (const [i, p] of list.entries()) {
  if (!p?.name)    { console.error(`\n  Entry ${i + 1} has no "name".\n`);                 process.exit(1); }
  if (!p?.message) { console.error(`\n  "${p.name}" has no "message".\n`);                 process.exit(1); }
}

const people = assignCodes(list);

/* --codes: just show the list and stop */
if (process.argv.includes('--codes')) {
  const w = Math.max(...people.map(p => p.name.length));
  console.log('');
  for (const p of people) console.log(`  ${p.name.padEnd(w)}   ${p.code}`);
  console.log(`\n  ${people.length} codes.\n`);
  process.exit(0);
}

const salt = randomBytes(16);
const records = [];

process.stdout.write(`\n  Encrypting ${people.length} messages (1M PBKDF2 rounds each, this takes a moment)\n  `);

for (const p of people) {
  const key = pbkdf2Sync(p.code, salt, ITERATIONS, KEYLEN, 'sha256');
  const iv  = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const payload = JSON.stringify({ name: p.name, message: p.message });
  const ct  = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  records.push({
    iv: iv.toString('base64'),
    ct: Buffer.concat([ct, tag]).toString('base64'),   // WebCrypto expects the tag appended
  });
  process.stdout.write('·');
}

writeFileSync(OUT, JSON.stringify({
  v: 1,
  salt: salt.toString('base64'),
  iterations: ITERATIONS,
  records: shuffle(records),      // order tells you nothing
}, null, 0) + '\n');

console.log(`\n\n  → ${OUT}`);
console.log(`     ${records.length} records, no names, nothing readable.\n`);

const w = Math.max(...people.map(p => p.name.length));
console.log('  Send these out:\n');
for (const p of people) console.log(`    ${p.name.padEnd(w)}   ${p.code}`);
console.log('');
