const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const url = process.env.OHTAAWA_QA_URL ||
  "http://127.0.0.1:4186/risk-zones/?utm_source=codex&utm_medium=qa&utm_campaign=wave46_tracking_smoke&utm_content=riskzones_price&scenario=risk-zones&experiment_id=wave46_owner_qa";
const outputDir = process.env.OHTAAWA_QA_OUTPUT || path.resolve(
  __dirname,
  "../../../docs/ohtaawa-retargeting/agent-work/2026-08-09/landing-wave46-risk-zones-qa",
);

const requiredEvents = [
  "landing_view_risk_zones_v1",
  "package_view_risk_zones_v1",
  "price_view_risk_zones_v1",
  "proof_view_risk_zones_v1",
  "scroll_50_risk_zones_v1",
  "scroll_90_risk_zones_v1",
  "contact_sheet_open_risk_zones_v1",
  "contact_channel_click_risk_zones_v1",
  "lead_telegram_risk_zones_v1",
  "lead_whatsapp_risk_zones_v1",
  "lead_max_risk_zones_v1",
  "lead_phone_risk_zones_v1",
  "proof_carousel_risk_zones_v1",
  "proof_gallery_open_risk_zones_v1",
  "faq_open_risk_zones_v1",
  "reviews_click_risk_zones_v1",
  "map_click_risk_zones_v1",
];

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.OHTAAWA_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const metrikaRequests = [];
  const consoleErrors = [];
  page.on("request", (request) => {
    if (/mc\.yandex\.ru\/metrika\/tag\.js|mc\.yandex\.ru\/watch\//.test(request.url())) metrikaRequests.push(request.url());
  });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.ohtaawaAnalytics));
    await page.evaluate(() => document.addEventListener("click", (event) => {
      if (event.target.closest("a")) event.preventDefault();
    }, true));

    for (const selector of [
      '[data-view-event="package_view_risk_zones_v1"]',
      '[data-view-event="price_view_risk_zones_v1"]',
      '[data-view-event="proof_view_risk_zones_v1"]',
    ]) {
      await page.locator(selector).first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(280);
    }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
    await page.waitForTimeout(180);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(280);

    await page.locator('[data-track-event="reviews_click_risk_zones_v1"]').first().click({ force: true });
    await page.locator('[data-track-event="map_click_risk_zones_v1"]').first().click({ force: true });
    await page.locator("[data-carousel-next]").click({ force: true });
    await page.locator("[data-carousel-open]").click({ force: true });
    await page.locator("[data-gallery-close]").click({ force: true });
    await page.locator(".faq-list details summary").first().click({ force: true });
    await page.locator("[data-open-contact]").first().click({ force: true });
    for (const channel of ["telegram", "whatsapp", "max", "phone"]) {
      await page.locator(`#contact-sheet [data-channel="${channel}"]`).click({ force: true });
    }

    const result = await page.evaluate(() => ({
      isQa: window.ohtaawaAnalytics.isQa,
      counter: window.ohtaawaAnalytics.config.metrikaCounter,
      bodyCounter: document.body.dataset.ohtaawaMetricaCounterIds,
      attribution: window.ohtaawaAnalytics.attribution,
      events: window.ohtaawaAnalytics.qaEvents.map(({ event }) => event),
    }));
    const missingEvents = requiredEvents.filter((event) => !result.events.includes(event));
    const report = {
      pass: result.isQa === true && Number(result.counter) === 110584673 &&
        result.bodyCounter === "110584673" && result.attribution.service_route === "risk_zones" &&
        result.attribution.offer_id === "risk_zones_fixed_60" && result.attribution.scenario === "risk-zones" &&
        result.attribution.experiment_id === "wave46_owner_qa" && missingEvents.length === 0 &&
        metrikaRequests.length === 0 && consoleErrors.length === 0,
      qaIsolation: result.isQa,
      counter: result.counter,
      bodyCounter: result.bodyCounter,
      attribution: result.attribution,
      eventCount: result.events.length,
      missingEvents,
      metrikaRequestCount: metrikaRequests.length,
      consoleErrors,
    };
    fs.writeFileSync(path.join(outputDir, "tracking-qa.json"), `${JSON.stringify(report, null, 2)}\n`);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    if (!report.pass) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
