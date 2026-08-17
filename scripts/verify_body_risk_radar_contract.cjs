const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const exists = relative => fs.existsSync(path.join(root, relative));

const html = read("body-radar/index.html");
const app = read("body-radar/app.js");
const css = read("body-radar/styles.css");
const provenance = JSON.parse(read("docs/BODY_RISK_RADAR_ASSET_PROVENANCE.json"));
const qa = JSON.parse(read("proof/body-risk-radar-2026-08-17/qa-report.json"));

assert.match(html, /data-ohtaawa-metrica-counter-id="110584673"/);
assert.match(html, /<link rel="canonical" href="https:\/\/go\.detailingspb\.ru\/body-radar\/">/);
assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.equal((html.match(/data-radar-subscribe/g) || []).length, 3);
assert.equal((html.match(/data-source-link/g) || []).length, 3);
assert.doesNotMatch(html, /<(form|input|textarea|select)\b/i);
assert.doesNotMatch(html, /без[^<]{0,60}рекламн/i);
assert.doesNotMatch(html, /передач[аи][^<]{0,40}персональн/i);
assert.doesNotMatch(html, /open-meteo/i);

for (const marker of [
  'const COUNTER_ID = 110584673',
  'const EXPERIMENT_ID = "body_risk_radar_w34"',
  'const SCENARIO = "vehicle_risk_signal_optin"',
  'const CHANNEL_CODE = "BRR_W34"',
  'unconventional_body_risk_radar_2026w34',
  'body_radar_view_v1',
  'body_radar_subscribe_click_v1',
  'body_radar_source_click_v1',
  'lead_telegram_body_radar_v1',
  'lead_telegram_polish_film_v8',
  'qaSources'
]) assert.ok(app.includes(marker), `missing app marker: ${marker}`);

assert.doesNotMatch(css, /position\s*:\s*fixed/i);
for (const asset of [
  "assets/ohtaawa-mark.png",
  "assets/ohtaawa-wordmark.png",
  "estimate-check/assets/real-gloss-panel.webp"
]) assert.ok(exists(asset), `missing asset: ${asset}`);

assert.equal(provenance.generated_assets.length, 0);
assert.ok(provenance.assets.length >= 3);
assert.equal(qa.verdict, "PASS");
assert.equal(qa.viewports.length, 2);
assert.ok(qa.viewports.every(item => item.initial.overflow === 0));
assert.ok(qa.viewports.every(item => item.initial.fixedElements === 0));
assert.ok(qa.viewports.every(item => item.initial.formControls === 0));
assert.ok(qa.viewports.every(item => item.metrikaRequests === 0));
assert.ok(qa.viewports.every(item => item.failedRequests === 0));

console.log(JSON.stringify({
  verdict: "PASS",
  route: "/body-radar/",
  dataCollectionForm: false,
  tracking: "ISOLATED",
  stickyCta: false,
  assets: provenance.assets.length,
  proofViewports: qa.viewports.length
}));
