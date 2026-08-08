const { chromium } = require("playwright");

async function main() {
const url =
  process.env.OHTAAWA_QA_URL ||
  "http://127.0.0.1:4185/?utm_source=codex&utm_medium=qa&utm_campaign=wave45_smoke&scenario=full-film&experiment_id=wave45_owner_qa";

const requiredEvents = [
  "price_view_polish_film_v9",
  "offer_terms_view_polish_film_v8",
  "proof_view_polish_film_v9",
  "landing_scroll_50_polish_film_v8",
  "landing_scroll_90_polish_film_v8",
  "lead_phone_polish_film_v8",
  "lead_telegram_polish_film_v8",
  "lead_whatsapp_polish_film_v8",
  "lead_max_direct_polish_film_v8",
  "route_main_site_v8",
  "route_telegram_channel_v8",
  "route_yandex_maps_v8",
  "route_yandex_reviews_v8",
];

const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.OHTAAWA_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const metrikaRequests = [];
const consoleErrors = [];

page.on("request", (request) => {
  if (
    request.frame() === page.mainFrame() &&
    /mc\.yandex\.ru\/metrika\/tag\.js|mc\.yandex\.ru\/watch\//.test(request.url())
  ) {
    metrikaRequests.push(request.url());
  }
});
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

try {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.ohtaawaAnalytics));

  await page.evaluate(() => {
    document.addEventListener(
      "click",
      (event) => {
        if (event.target.closest("a")) event.preventDefault();
      },
      true,
    );
  });

  for (const selector of [
    '[data-view-event="offer_terms_view_polish_film_v8"]',
    '[data-view-event="proof_view_polish_film_v9"]',
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
  }

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
  await page.waitForTimeout(150);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(250);

  for (const selector of [
    '[data-track-event="route_main_site_v8"]',
    '[data-track-event="route_telegram_channel_v8"]',
    '[data-track-event="route_yandex_maps_v8"]',
    '[data-track-event="route_yandex_reviews_v8"]',
    '[data-track-event="lead_phone_polish_film_v8"]',
  ]) {
    await page.locator(selector).first().click({ force: true });
  }

  await page.locator("[data-open-contact]").first().click();
  for (const channel of ["telegram", "whatsapp", "max", "phone"]) {
    await page.locator(`[data-channel="${channel}"]`).click({ force: true });
  }

  const result = await page.evaluate(() => ({
    isQa: window.ohtaawaAnalytics.isQa,
    counter: window.ohtaawaAnalytics.config.metrikaCounter,
    events: window.ohtaawaAnalytics.qaEvents.map(({ event }) => event),
    bodyCounter: document.body.dataset.ohtaawaMetricaCounterIds,
  }));
  const missingEvents = requiredEvents.filter((event) => !result.events.includes(event));

  const report = {
    pass:
      result.isQa === true &&
      Number(result.counter) === 110584673 &&
      result.bodyCounter === "110584673" &&
      missingEvents.length === 0 &&
      metrikaRequests.length === 0 &&
      consoleErrors.length === 0,
    qaIsolation: result.isQa,
    counter: result.counter,
    bodyCounter: result.bodyCounter,
    eventCount: result.events.length,
    missingEvents,
    metrikaRequestCount: metrikaRequests.length,
    consoleErrors,
  };

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
