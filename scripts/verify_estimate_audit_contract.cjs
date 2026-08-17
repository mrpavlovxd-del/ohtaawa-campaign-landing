const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const exists = relative => fs.existsSync(path.join(root, relative));

const html = read("estimate-check/index.html");
const app = read("estimate-check/app.js");
const css = read("estimate-check/styles.css");
const qa = JSON.parse(read("proof/estimate-check-2026-08-17/qa-report.json"));
const provenance = JSON.parse(read("docs/ESTIMATE_AUDIT_ASSET_PROVENANCE.json"));

assert.match(html, /data-ohtaawa-metrica-counter-id="110584673"/);
assert.match(html, /<link rel="canonical" href="https:\/\/go\.detailingspb\.ru\/estimate-check\/">/);
assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
assert.equal((html.match(/type="checkbox"/g) || []).length, 6);
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.doesNotMatch(html, /type=["']file["']/i);
assert.doesNotMatch(html, /<form[^>]+action=/i);

for (const marker of [
  'const COUNTER_ID = 110584673',
  'const EXPERIMENT_ID = "estimate_audit_w34"',
  'const SCENARIO = "quote_second_opinion"',
  'const CHANNEL_CODE = "EST_W34"',
  'unconventional_quote_audit_2026w34',
  'estimate_audit_started_v1',
  'estimate_audit_result_v1',
  'lead_telegram_estimate_audit_v1',
  'lead_telegram_polish_film_v8',
  'qaSources'
]) assert.ok(app.includes(marker), `missing app marker: ${marker}`);

assert.doesNotMatch(css, /position\s*:\s*fixed/i);
for (const asset of [
  "estimate-check/assets/ohtaawa-mark.png",
  "estimate-check/assets/ohtaawa-wordmark.png",
  "estimate-check/assets/real-gloss-panel.webp"
]) assert.ok(exists(asset), `missing asset: ${asset}`);

assert.equal(qa.verdict, "PASS");
assert.equal(qa.viewports.length, 2);
assert.ok(qa.viewports.every(item => item.initial.overflow === 0));
assert.ok(qa.viewports.every(item => item.initial.fileInputs === 0));
assert.ok(qa.viewports.every(item => item.metrikaRequests === 0));
assert.equal(provenance.assets.length, 3);
assert.equal(provenance.generated_assets.length, 0);

console.log(JSON.stringify({
  verdict: "PASS",
  checkboxes: 6,
  fileUpload: false,
  tracking: "ISOLATED",
  proofViewports: qa.viewports.length,
  assets: provenance.assets.length
}));
