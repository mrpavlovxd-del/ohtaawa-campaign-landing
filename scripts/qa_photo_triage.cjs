const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const PROOF = path.join(ROOT, "proof", "photo-triage-2026-08-17");
const PORT = 4201;
const TEST_URL = `http://go.detailingspb.ru:${PORT}/photo-check/?utm_source=qa&utm_medium=codex&utm_campaign=unconventional_photo_triage_2026w34&utm_content=browser_qa&partner_code=qa-partner&entry_signal=qa-fixture&_ym_debug=1`;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

function startServer() {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, `http://127.0.0.1:${PORT}`);
    const relative = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\/+/, "");
    const file = path.resolve(ROOT, relative.endsWith("/") ? path.join(relative, "index.html") : relative);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(response);
  });
  return new Promise(resolve => server.listen(PORT, "127.0.0.1", () => resolve(server)));
}

async function inspectViewport(browser, viewport, name) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: name === "mobile" ? 2 : 1 });
  const page = await context.newPage();
  const metrikaRequests = [];
  const failedRequests = [];
  page.on("request", request => {
    if (request.url().includes("mc.yandex.ru")) metrikaRequests.push(request.url());
  });
  page.on("requestfailed", request => failedRequests.push(request.url()));
  await page.goto(TEST_URL, { waitUntil: "networkidle" });

  const initial = await page.evaluate(() => {
    const fixed = [...document.querySelectorAll("body *")].filter(element => getComputedStyle(element).position === "fixed");
    const heroCta = document.querySelector('[data-photo-cta][data-location="hero"]');
    const h1Rect = document.querySelector("h1")?.getBoundingClientRect();
    return {
      title: document.title,
      h1: document.querySelectorAll("h1").length,
      formControls: document.querySelectorAll("form,input,textarea,select").length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      fixedElements: fixed.length,
      qa: window.__OHTAAWA_PHOTO_TRIAGE__?.isQa,
      scenario: window.__OHTAAWA_PHOTO_TRIAGE__?.context?.scenario,
      experiment: window.__OHTAAWA_PHOTO_TRIAGE__?.context?.experiment_id,
      channelCode: window.__OHTAAWA_PHOTO_TRIAGE__?.context?.channel_code,
      partnerCode: window.__OHTAAWA_PHOTO_TRIAGE__?.context?.partner_code,
      photoCtas: document.querySelectorAll("[data-photo-cta]").length,
      heroCtaVisible: Boolean(heroCta?.getBoundingClientRect().height),
      heroBackground: getComputedStyle(document.querySelector(".hero-media")).backgroundImage,
      h1Right: h1Rect?.right,
      viewportWidth: innerWidth
    };
  });

  assert.equal(initial.h1, 1);
  assert.equal(initial.formControls, 0);
  assert.ok(initial.overflow <= 1, `${name}: horizontal overflow ${initial.overflow}`);
  assert.equal(initial.fixedElements, 0, `${name}: sticky/fixed UI is forbidden`);
  assert.equal(initial.qa, true);
  assert.equal(initial.scenario, "photo_defect_triage");
  assert.equal(initial.experiment, "photo_triage_w34");
  assert.equal(initial.channelCode, "PHT_W34");
  assert.equal(initial.partnerCode, "qa-partner");
  assert.equal(initial.photoCtas, 5);
  assert.equal(initial.heroCtaVisible, true);
  assert.match(initial.heroBackground, /real-gloss-panel\.webp/);
  assert.ok(initial.h1Right <= initial.viewportWidth + 1, `${name}: h1 is clipped`);
  assert.equal(metrikaRequests.length, 0, `${name}: QA must not call Metrika`);
  assert.equal(failedRequests.length, 0, `${name}: failed requests ${failedRequests.join(", ")}`);

  await page.screenshot({ path: path.join(PROOF, `${name}-hero.png`), fullPage: false, animations: "disabled" });

  await page.locator('[data-photo-cta][data-location="hero"]').evaluate(link => {
    link.addEventListener("click", event => event.preventDefault(), { capture: true, once: true });
  });
  await page.locator('[data-photo-cta][data-location="hero"]').click();
  await page.locator("[data-guide-link]").click();
  await page.locator("#shots").scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(PROOF, `${name}-shots.png`), fullPage: false, animations: "disabled" });

  await page.locator("#routes").scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(PROOF, `${name}-routes.png`), fullPage: false, animations: "disabled" });

  await page.locator(".reply").scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(PROOF, `${name}-reply.png`), fullPage: false, animations: "disabled" });

  await page.locator(".inspection").scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(PROOF, `${name}-inspection.png`), fullPage: false, animations: "disabled" });

  await page.locator(".final-section").scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(PROOF, `${name}-final.png`), fullPage: false, animations: "disabled" });

  const final = await page.evaluate(() => {
    const events = (window.dataLayer || []).map(item => ({
      name: item.event_name,
      scenario: item.scenario,
      experiment: item.experiment_id,
      channelCode: item.channel_code,
      partnerCode: item.partner_code,
      entrySignal: item.entry_signal
    }));
    const buttons = [...document.querySelectorAll(".button")].map(button => ({
      text: button.textContent.trim(),
      overflow: button.scrollWidth - button.clientWidth,
      height: button.getBoundingClientRect().height
    }));
    return {
      events,
      buttons,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      finalCtaVisible: Boolean(document.querySelector('[data-photo-cta][data-location="final"]')?.getBoundingClientRect().height)
    };
  });

  for (const expected of [
    "photo_triage_view_v1",
    "photo_triage_telegram_click_v1",
    "photo_triage_shot_guide_v1",
    "photo_triage_route_view_v1",
    "photo_triage_inspection_view_v1",
    "lead_telegram_polish_film_v8"
  ]) assert.ok(final.events.some(item => item.name === expected), `${name}: missing event ${expected}`);
  assert.ok(final.events.every(item => item.scenario === "photo_defect_triage"));
  assert.ok(final.events.every(item => item.experiment === "photo_triage_w34"));
  assert.ok(final.events.every(item => item.channelCode === "PHT_W34"));
  assert.ok(final.events.every(item => item.partnerCode === "qa-partner"));
  assert.ok(final.events.every(item => item.entrySignal === "qa-fixture"));
  assert.ok(final.buttons.every(button => button.overflow <= 1 && button.height >= 50), `${name}: CTA clipping or undersized target`);
  assert.ok(final.overflow <= 1, `${name}: final horizontal overflow ${final.overflow}`);
  assert.equal(final.finalCtaVisible, true);

  await context.close();
  return {
    name,
    viewport,
    initial,
    eventNames: final.events.map(item => item.name),
    buttonCount: final.buttons.length,
    metrikaRequests: metrikaRequests.length,
    failedRequests: failedRequests.length
  };
}

async function main() {
  fs.mkdirSync(PROOF, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch({
    headless: true,
    args: ["--host-resolver-rules=MAP go.detailingspb.ru 127.0.0.1"]
  });
  try {
    const desktop = await inspectViewport(browser, { width: 1440, height: 1000 }, "desktop");
    const mobile = await inspectViewport(browser, { width: 390, height: 844 }, "mobile");
    const report = {
      verdict: "PASS",
      testedAt: new Date().toISOString(),
      url: TEST_URL,
      viewports: [desktop, mobile],
      publicDeployPerformed: false
    };
    fs.writeFileSync(path.join(PROOF, "qa-report.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ verdict: report.verdict, screenshots: 12, viewports: 2, tracking: "PASS", privacy: "NO_FORM_OR_SITE_UPLOAD" }, null, 2));
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
