const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const exists = relative => fs.existsSync(path.join(root, relative));

const html = read("photo-check/index.html");
const app = read("photo-check/app.js");
const css = read("photo-check/styles.css");
const provenance = JSON.parse(read("docs/PHOTO_TRIAGE_ASSET_PROVENANCE.json"));
const qa = JSON.parse(read("proof/photo-triage-2026-08-17/qa-report.json"));

assert.match(html, /data-ohtaawa-metrica-counter-id="110584673"/);
assert.match(html, /<link rel="canonical" href="https:\/\/go\.detailingspb\.ru\/photo-check\/">/);
assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.equal((html.match(/data-photo-cta/g) || []).length, 5);
assert.doesNotMatch(html, /<(form|input|textarea|select)\b/i);
assert.match(html, /не ставим диагноз/i);
assert.match(html, /не называем окончательную цену/i);
assert.match(html, /не включайте в кадр лица, документы и номер автомобиля/i);
assert.doesNotMatch(html, /ответим за|за \d+ минут|точно исправим|гарантируем результат/i);

for (const marker of [
  "const COUNTER_ID = 110584673",
  'const EXPERIMENT_ID = "photo_triage_w34"',
  'const SCENARIO = "photo_defect_triage"',
  'const CHANNEL_CODE = "PHT_W34"',
  "unconventional_photo_triage_2026w34",
  "photo_triage_view_v1",
  "photo_triage_telegram_click_v1",
  "photo_triage_shot_guide_v1",
  "photo_triage_route_view_v1",
  "photo_triage_inspection_view_v1",
  "lead_telegram_polish_film_v8",
  "qaSources"
]) assert.ok(app.includes(marker), `missing app marker: ${marker}`);

assert.doesNotMatch(css, /position\s*:\s*fixed/i);
for (const asset of [
  "assets/ohtaawa-mark.png",
  "assets/ohtaawa-wordmark.png",
  "estimate-check/assets/real-gloss-panel.webp"
]) assert.ok(exists(asset), `missing asset: ${asset}`);

assert.equal(provenance.generated_assets.length, 0);
assert.equal(provenance.assets.length, 3);
assert.equal(qa.verdict, "PASS");
assert.equal(qa.viewports.length, 2);
assert.ok(qa.viewports.every(item => item.initial.overflow === 0));
assert.ok(qa.viewports.every(item => item.initial.fixedElements === 0));
assert.ok(qa.viewports.every(item => item.initial.formControls === 0));
assert.ok(qa.viewports.every(item => item.metrikaRequests === 0));
assert.ok(qa.viewports.every(item => item.failedRequests === 0));

console.log(JSON.stringify({
  verdict: "PASS",
  route: "/photo-check/",
  dataCollectionForm: false,
  siteUpload: false,
  tracking: "ISOLATED",
  stickyCta: false,
  assets: provenance.assets.length,
  proofViewports: qa.viewports.length
}));
