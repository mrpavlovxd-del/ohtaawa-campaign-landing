const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.join(__dirname, "..");
const proofDir = path.join(root, "proof", "2026-07-24-wave26-landing-bridge");
const experimentId = "wave26";

const mime = {
  ".html": "text/html; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

function createServer() {
  return http.createServer((request, response) => {
    const requestUrl = new URL(request.url, "http://127.0.0.1");
    const relativePath = decodeURIComponent(
      requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname
    );
    const filePath = path.resolve(root, `.${relativePath}`);
    if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": mime[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

function variantUrl(baseUrl, label) {
  const url = new URL(baseUrl);
  url.searchParams.set("utm_source", "qa");
  url.searchParams.set("utm_medium", "qa");
  url.searchParams.set("utm_campaign", "wave26_ya_rsya_premium_recent_condition_check");
  url.searchParams.set("utm_content", `relationship_first_${label}`);
  url.searchParams.set("scenario", "crm-premium-recent");
  url.searchParams.set("experiment_id", experimentId);
  url.searchParams.set("_ym_debug", "1");
  return url.toString();
}

async function inspectViewport(browser, baseUrl, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1
  });
  await context.route("**/*", route => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1") route.continue();
    else route.abort();
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));

  await page.goto(variantUrl(baseUrl, viewport.name), { waitUntil: "networkidle" });
  await page.waitForSelector('html[data-ohtaawa-experiment="wave26-premium-recent"]');
  const bridge = page.locator(".after-price-bridge");
  await bridge.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);

  const result = await page.evaluate(() => {
    const bridgeNode = document.querySelector(".after-price-bridge");
    const telegram = bridgeNode.querySelector('[data-ohtaawa-event="lead_telegram_polish_film_v8"]');
    const phone = bridgeNode.querySelector('[data-ohtaawa-event="lead_phone_polish_film_v8"]');
    return {
      experiment: document.documentElement.getAttribute("data-ohtaawa-experiment"),
      afterPrice: document.documentElement.getAttribute("data-ohtaawa-after-price"),
      experimentId: window.ohtaawaExperimentId,
      scenario: window.ohtaawaScenario,
      display: getComputedStyle(bridgeNode).display,
      heading: bridgeNode.querySelector("h3")?.textContent.trim() || "",
      text: bridgeNode.querySelector("p")?.textContent.trim() || "",
      heroHeadline: document.querySelector('[data-scenario-slot="headline"]')?.textContent.trim() || "",
      telegramMessage: telegram?.getAttribute("data-ohtaawa-clipboard") || "",
      telegramLocation: telegram?.getAttribute("data-ohtaawa-location") || "",
      phoneLocation: phone?.getAttribute("data-ohtaawa-location") || "",
      stickySuppressed: document.querySelector(".mobile-sticky")?.classList.contains("is-suppressed") || false,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  });

  await page.evaluate(() => {
    document
      .querySelector('.after-price-bridge [data-ohtaawa-event="lead_telegram_polish_film_v8"]')
      .addEventListener("click", event => event.preventDefault(), { capture: true, once: true });
  });
  await page.locator('.after-price-bridge [data-ohtaawa-event="lead_telegram_polish_film_v8"]').click();
  result.telegramEvent = await page.evaluate(() => {
    const event = (window.dataLayer || []).filter(item =>
      item.event_name === "lead_telegram_polish_film_v8" && item.location === "after_price"
    ).at(-1) || {};
    return {
      name: event.event_name || "",
      location: event.location || "",
      experimentId: event.experiment_id || "",
      scenario: event.scenario || "",
      destination: event.destination || ""
    };
  });

  await bridge.screenshot({
    path: path.join(proofDir, `${viewport.name}-wave26-after-price.png`)
  });
  await page.screenshot({
    path: path.join(proofDir, `${viewport.name}-wave26-after-price-viewport.png`),
    fullPage: false
  });

  assert.equal(result.experiment, "wave26-premium-recent");
  assert.equal(result.afterPrice, "enabled");
  assert.equal(result.experimentId, experimentId);
  assert.equal(result.scenario, "crm");
  assert.equal(result.display, "grid");
  assert.equal(result.heroHeadline, "OHTAAWA теперь не только мойка");
  assert.equal(result.heading, "Что действительно стоит сделать с кузовом?");
  assert.match(result.text, /достаточно полировки/);
  assert.match(result.text, /защитная пленка/);
  assert.match(result.telegramMessage, /Я клиент OHTAAWA/);
  assert.equal(result.telegramLocation, "after_price");
  assert.equal(result.phoneLocation, "after_price");
  assert.equal(result.stickySuppressed, true);
  assert.equal(result.horizontalOverflow, false);
  assert.deepEqual(result.telegramEvent, {
    name: "lead_telegram_polish_film_v8",
    location: "after_price",
    experimentId,
    scenario: "crm",
    destination: "telegram"
  });
  assert.deepEqual(pageErrors, []);

  await context.close();
  return { viewport, ...result };
}

async function main() {
  fs.mkdirSync(proofDir, { recursive: true });
  const server = createServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ headless: true });
  const report = {
    generatedAt: new Date().toISOString(),
    experimentId,
    viewports: []
  };
  try {
    for (const viewport of [
      { name: "desktop-1440x1000", width: 1440, height: 1000 },
      { name: "mobile-390x844", width: 390, height: 844 },
      { name: "mobile-320x568", width: 320, height: 568 }
    ]) {
      report.viewports.push(await inspectViewport(browser, baseUrl, viewport));
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  const reportPath = path.join(proofDir, "wave26-landing-qa.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(`${reportPath}\n`);
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
