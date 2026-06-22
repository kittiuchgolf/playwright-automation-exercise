import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const RESULTS_DIR = 'a11y-results';
const BASELINE_PATH = 'docs/a11y-baseline.json';

/**
 * Pure diff: for each route in `current`, return the rule ids not present in
 * that route's `baseline` entry. Always returns an entry per current route
 * (empty array when nothing is new).
 */
export function diffViolations(baseline, current) {
  const out = {};
  for (const [route, ids] of Object.entries(current)) {
    const known = new Set(baseline[route] ?? []);
    out[route] = ids.filter((id) => !known.has(id));
  }
  return out;
}

function readResultsDir(dir = RESULTS_DIR) {
  if (!fs.existsSync(dir)) return {};
  const map = {};
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    const { route, violations } = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    map[route] = [...violations].sort();
  }
  return map;
}

function readBaseline(p = BASELINE_PATH) {
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
}

function writeBaseline(map, p = BASELINE_PATH) {
  const sorted = Object.fromEntries(
    Object.keys(map)
      .sort()
      .map((route) => [route, [...map[route]].sort()]),
  );
  fs.writeFileSync(p, `${JSON.stringify(sorted, null, 2)}\n`);
}

function main() {
  const update = process.argv.includes('--update');
  const current = readResultsDir();

  if (update) {
    writeBaseline(current);
    console.log(`Updated baseline (${Object.keys(current).length} routes) at ${BASELINE_PATH}.`);
    return;
  }

  const newByRoute = diffViolations(readBaseline(), current);
  const routesWithNew = Object.entries(newByRoute).filter(([, ids]) => ids.length > 0);

  let md = '## ♿ Accessibility diff vs baseline\n\n';
  if (routesWithNew.length === 0) {
    md += 'No new violations. ✅\n';
  } else {
    md += '| Route | New rule ids |\n|---|---|\n';
    for (const [route, ids] of routesWithNew) md += `| \`${route}\` | ${ids.join(', ')} |\n`;
  }

  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) fs.appendFileSync(summaryFile, `${md}\n`);
  else console.log(md);

  // Report-only: never fail the build.
  process.exit(0);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
