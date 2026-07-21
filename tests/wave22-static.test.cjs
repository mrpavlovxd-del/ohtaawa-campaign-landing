const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

test("wave22 is activated only by its explicit experiment id", () => {
  assert.match(html, /experimentId === "wave22_ya_search_polish_proof_first"/);
  assert.match(html, /data-ohtaawa-experiment", "wave22-polish-proof-first"/);
});

test("wave22 uses real polishing proof and a photo-dialogue CTA", () => {
  assert.match(html, /polish-real-before-after-v9\.webp/);
  assert.match(html, /data-asset-source="owner-provided-real-before-after"/);
  assert.match(html, /Хочу оценить полировку по фото/);
  assert.match(html, /data-ohtaawa-location="photo_estimate"/);
});

test("wave22 keeps a dedicated call route and measurable proof events", () => {
  assert.match(html, /href="tel:\+78127678840"/);
  assert.match(html, /data-ohtaawa-view-event="proof_view_polish_film_v9"/);
  assert.match(html, /price_view_polish_film_v9/);
});
