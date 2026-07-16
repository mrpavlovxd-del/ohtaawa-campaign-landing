import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const indexPath = fileURLToPath(new URL("../index.html", import.meta.url));
const html = await readFile(indexPath, "utf8");
const bridgeMatch = html.match(/<script id="ohtaawa-vk-pixel-bridge">([\s\S]*?)<\/script>/);

assert.ok(bridgeMatch, "VK Pixel bridge must exist");
const bridge = bridgeMatch[1];

const eventMap = {
  lead_phone_polish_film_v8: "ctaPhone",
  lead_telegram_polish_film_v8: "ctaTelegram",
  lead_whatsapp_polish_film_v8: "ctaWhatsapp",
  lead_max_direct_polish_film_v8: "ctaMax",
  price_view_polish_film_v9: "priceView",
  proof_view_polish_film_v9: "proofView"
};

test("bridge is in head and uses only the official runtime", () => {
  const bridgePosition = html.indexOf('<script id="ohtaawa-vk-pixel-bridge">');
  assert.ok(bridgePosition > 0 && bridgePosition < html.indexOf("</head>"));
  assert.match(bridge, /var pixelId = "3639916";/);
  assert.match(bridge, /var scriptSource = "https:\/\/top-fwz1\.mail\.ru\/js\/code\.js";/);
  assert.doesNotMatch(html, /top-fwz1\.mail\.ru\/counter/i);
  assert.doesNotMatch(html, /VK\.Retargeting|openapi\.js|tag manager/i);
});

test("tracking is default-deny and has an explicit revoke path", () => {
  assert.match(bridge, /var enabled = false;/);
  assert.match(bridge, /if \(enabled \|\| !hasConsent\(\)\) return false;/);
  assert.match(bridge, /window\.ohtaawaAnalyticsConsent === true/);
  assert.match(bridge, /document\.addEventListener\("ohtaawa:analytics-consent", handleConsent\)/);
  assert.match(bridge, /if \(consent\) enable\(\);\s*else disable\(\);/);
});

test("page view is canonical and strips query and referrer data", () => {
  assert.match(html, /<meta name="referrer" content="strict-origin-when-cross-origin" \/>/);
  assert.match(bridge, /var canonicalUrl = "https:\/\/go\.detailingspb\.ru\/";/);
  assert.match(bridge, /url: canonicalUrl,\s*referrer: ""/);
  assert.match(bridge, /script\.referrerPolicy = "no-referrer";/);
  assert.doesNotMatch(bridge, /location\.(?:href|search)|document\.referrer|URLSearchParams/);
});

test("only allowlisted CTA, price and proof events are mapped", () => {
  for (const [sourceEvent, vkGoal] of Object.entries(eventMap)) {
    assert.match(bridge, new RegExp(`${sourceEvent}: "${vkGoal}"`));
    assert.match(vkGoal, /^[A-Za-z0-9]+$/);
  }
  assert.match(html, /window\.ohtaawaVkPixel\.track\(name\);/);
  assert.equal((html.match(/window\.ohtaawaVkPixel\.track\(name\);/g) || []).length, 1);
});

test("VK commands cannot contain PII, message text or arbitrary params", () => {
  assert.doesNotMatch(bridge, /userid|email|params|experiment_id|utm_|clipboard|message|79910102020|78127678840/i);
  assert.match(bridge, /queue\(\{ id: pixelId, type: "reachGoal", goal: goal \}\);/);
  assert.match(bridge, /if \(!enabled \|\| !hasConsent\(\) \|\| !goal \|\| sentGoals\[goal\]\) return false;/);
});

test("go-only Metrika transition remains present and untouched by the bridge", () => {
  assert.match(html, /window\.ohtaawaMetricaCounterIds = window\.ohtaawaMetricaCounterIds \|\| \["100699599", "110584673"\]/);
  assert.match(html, /ym\(110584673, "init"/);
  assert.doesNotMatch(bridge, /110584673|100699599|window\.ym/);
});
