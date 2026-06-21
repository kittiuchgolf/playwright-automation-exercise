import fs from 'node:fs';

const project = process.argv[2] ?? 'tests';
const summaryFile = process.env.GITHUB_STEP_SUMMARY;
const resultsPath = 'results.json';

if (!fs.existsSync(resultsPath)) {
  console.log(`No ${resultsPath} found; skipping summary for ${project}.`);
  process.exit(0);
}

const report = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
const stats = report.stats ?? {};
const passed = stats.expected ?? 0;
const failed = stats.unexpected ?? 0;
const flaky = stats.flaky ?? 0;
const skipped = stats.skipped ?? 0;
const total = passed + failed + flaky + skipped;
const durationS = ((stats.duration ?? 0) / 1000).toFixed(1);

const failedTitles = [];
const walk = (suites = []) => {
  for (const suite of suites) {
    for (const spec of suite.specs ?? []) {
      if (spec.ok === false) failedTitles.push(`${suite.title} › ${spec.title}`);
    }
    walk(suite.suites);
  }
};
walk(report.suites);

const icon = failed > 0 ? '❌' : '✅';
let md = `## ${icon} ${project} test results\n\n`;
md += '| Total | ✅ Passed | ❌ Failed | ⚠️ Flaky | ⏭️ Skipped | ⏱️ Duration |\n';
md += '|------:|---------:|---------:|--------:|----------:|------------:|\n';
md += `| ${total} | ${passed} | ${failed} | ${flaky} | ${skipped} | ${durationS}s |\n`;

if (failedTitles.length > 0) {
  md += '\n### Failed tests\n';
  for (const title of failedTitles) md += `- ${title}\n`;
}

if (summaryFile) {
  fs.appendFileSync(summaryFile, `${md}\n`);
  console.log(`Wrote ${project} summary to GITHUB_STEP_SUMMARY.`);
} else {
  console.log(md);
}
