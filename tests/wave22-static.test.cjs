const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

test("wave22 is activated only by its explicit experiment id", () => {
  assert.match(html, /var explicitExperimentId = \(params\.get\("experiment_id"\) \|\| ""\)\.trim\(\)/);
  assert.match(html, /isPolishProofFirst = explicitExperimentId === "wave22_ya_search_polish_proof_first"/);
  assert.doesNotMatch(html, /isPolishProofFirst = experimentId === "wave22_ya_search_polish_proof_first"/);
  assert.match(html, /data-ohtaawa-experiment", "wave22-polish-proof-first"/);
});

test("wave22 uses real polishing proof and a photo-dialogue CTA", () => {
  assert.match(html, /polish-real-before-after-v9\.webp/);
  assert.match(html, /data-asset-source="owner-provided-real-before-after"/);
  assert.match(html, /Хочу оценить полировку по фото/);
  assert.match(html, /data-ohtaawa-location="photo_estimate"/);
  assert.match(html, /data-src="assets\/polish-real-before-after-v9\.webp"/);
  assert.match(html, /proofImage\.setAttribute\("src", proofImage\.getAttribute\("data-src"\)\)/);
});

test("wave22 keeps a dedicated call route and measurable proof events", () => {
  assert.match(html, /href="tel:\+78127678840"/);
  assert.match(html, /data-ohtaawa-view-event="proof_view_polish_film_v9"/);
  assert.match(html, /price_view_polish_film_v9/);
  assert.match(html, /data-asset-source", "generated-illustrative"/);
  assert.match(html, /Иллюстрация процесса полировки кузова/);
  assert.doesNotMatch(html, /wave22-polish-proof-first"\] \.trust-band\s*\{/);
});

test("wave27 adds an isolated after-price contact bridge for wave22", () => {
  assert.match(html, /class="after-price-bridge"/);
  assert.match(html, /wave22-polish-proof-first"\] \.after-price-bridge \{ display: grid; \}/);
  assert.match(html, /data-ohtaawa-location="after_price"/);
  assert.match(html, /Нужен ориентир именно по вашему кузову\?/);
  assert.match(html, /Отправить 2–3 фото/);
  assert.match(html, /mobileSticky\.classList\.toggle\("is-suppressed", entry\.isIntersecting\)/);
});

test("wave27 reuses established lead goals and destinations", () => {
  const bridgeStart = html.indexOf('class="after-price-bridge"');
  const bridgeEnd = html.indexOf("</section>", bridgeStart);
  const bridge = html.slice(bridgeStart, bridgeEnd);

  assert.match(bridge, /href="https:\/\/t\.me\/ohtaawa_chat"/);
  assert.match(bridge, /data-ohtaawa-event="lead_telegram_polish_film_v8"/);
  assert.match(bridge, /href="tel:\+78127678840"/);
  assert.match(bridge, /data-ohtaawa-event="lead_phone_polish_film_v8"/);
  assert.doesNotMatch(bridge, /<form\b/);
  assert.doesNotMatch(bridge, /<img\b/);
  assert.doesNotMatch(bridge, /скидк|акци|срочно/i);
});
