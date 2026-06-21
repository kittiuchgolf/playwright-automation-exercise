import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'https://automationexercise.com';
const MAX_CHECKS = 120;

// Each target: a key, how to probe it, and what "up" means.
const TARGETS = [
  { key: 'homepage', run: () => probe('GET', '/'), ok: (r) => r.status === 200 },
  {
    key: 'productsList',
    run: () => probe('GET', '/api/productsList'),
    ok: (r) => r.status === 200 && r.responseCode === 200,
  },
  {
    key: 'brandsList',
    run: () => probe('GET', '/api/brandsList'),
    ok: (r) => r.status === 200 && r.responseCode === 200,
  },
  {
    key: 'searchProduct',
    run: () => probe('POST', '/api/searchProduct', { search_product: 'top' }),
    ok: (r) => r.responseCode === 200,
  },
  {
    key: 'verifyLogin',
    // Bogus creds on purpose: read-only liveness check, expects "User not found!".
    run: () => probe('POST', '/api/verifyLogin', { email: 'nope@nope.test', password: 'x' }),
    ok: (r) => r.responseCode === 404,
  },
];

async function probe(method, p, form) {
  const start = Date.now();
  const init = { method, redirect: 'manual' };
  if (form) {
    init.body = new URLSearchParams(form).toString();
    init.headers = { 'content-type': 'application/x-www-form-urlencoded' };
  }
  try {
    const res = await fetch(BASE + p, init);
    const ms = Date.now() - start;
    let responseCode = null;
    if (p.startsWith('/api/')) {
      const body = await res.json().catch(() => null);
      if (body && typeof body.responseCode === 'number') responseCode = body.responseCode;
    } else {
      await res.text().catch(() => undefined);
    }
    return { status: res.status, responseCode, ms };
  } catch {
    return { status: 0, responseCode: null, ms: Date.now() - start };
  }
}

function argVal(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function readHistory(p) {
  if (p && fs.existsSync(p)) {
    try {
      const h = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (Array.isArray(h.checks)) return h;
    } catch {
      /* corrupt/empty -> start fresh */
    }
  }
  return { targets: [], checks: [] };
}

async function main() {
  const outPath = argVal('--out');
  if (!outPath) {
    console.error('usage: node scripts/uptime-probe.mjs [--history <in.json>] --out <out.json>');
    process.exit(1);
  }

  const results = {};
  for (const t of TARGETS) {
    const r = await t.run();
    results[t.key] = { ok: t.ok(r), ms: r.ms, code: r.responseCode ?? r.status };
  }

  const history = readHistory(argVal('--history'));
  history.targets = TARGETS.map((t) => t.key);
  history.checks.push({ t: new Date().toISOString(), results });
  history.checks = history.checks.slice(-MAX_CHECKS);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(history, null, 2)}\n`);

  const up = Object.values(results).filter((r) => r.ok).length;
  console.log(`uptime check: ${up}/${TARGETS.length} up -> ${outPath}`);
}

main();
