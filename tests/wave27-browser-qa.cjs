const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.join(__dirname, "..");
const proofDir = path.join(root, "proof", "2026-07-23-wave27");
const experimentId = "wave22_ya_search_polish_proof_first";

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
    const relativePath = decodeURIComponent(requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname);
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
  url.searchParams.set("utm_campaign", "wave27_after_price_candidate");
  url.searchParams.set("utm_content", label);
  url.searchParams.set("scenario", "used-car");
  url.searchParams.set("experiment_id", experimentId);
  url.searchParams.set("_ym_debug", "1");
  return url.toString();
}

async function inspectControl(browser, baseUrl) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.route("**/*", route => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1") route.continue();
    else route.abort();
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}?scenario=used-car&_ym_debug=1&utm_source=qa&utm_medium=qa`, {
    waitUntil: "networkidle"
  });

  const control = await page.evaluate(() => {
    const bridge = document.querySelector(".after-price-bridge");
    return {
      experiment: document.documentElement.getAttribute("data-ohtaawa-experiment"),
      bridgeDisplay: getComputedStyle(bridge).display,
      bridgeAria: bridge.getAttribute("aria-label")
    };
  });

  assert.equal(control.experiment, null, "Control must not activate Wave22");
  assert.equal(control.bridgeDisplay, "none", "Control must keep the Wave27 bridge hidden");
  await context.close();
  return control;
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
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", message => {
    if (message.type() === "error" && !message.text().includes("ERR_FAILED")) {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", error => pageErrors.push(error.message));

  await page.goto(variantUrl(baseUrl, viewport.name), { waitUntil: "networkidle" });
  await page.waitForSelector('html[data-ohtaawa-experiment="wave22-polish-proof-first"]');
  const bridge = page.locator(".after-price-bridge");
  await bridge.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    const bridgeNode = document.querySelector(".after-price-bridge");
    const topbar = document.querySelector(".topbar");
    const offset = (topbar?.getBoundingClientRect().height || 0) + 16;
    const target = bridgeNode.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo(0, Math.max(0, target));
  });
  await page.waitForTimeout(200);

  const result = await page.evaluate(expectedExperiment => {
    const bridgeNode = document.querySelector(".after-price-bridge");
    const price = document.querySelector("#prices");
    const nextSection = price.nextElementSibling;
    const telegram = bridgeNode.querySelector('[data-ohtaawa-event="lead_telegram_polish_film_v8"]');
    const phone = bridgeNode.querySelector('[data-ohtaawa-event="lead_phone_polish_film_v8"]');
    const rect = bridgeNode.getBoundingClientRect();
    const topbarRect = document.querySelector(".topbar")?.getBoundingClientRect();

    return {
      experiment: document.documentElement.getAttribute("data-ohtaawa-experiment"),
      experimentId: window.ohtaawaExperimentId,
      display: getComputedStyle(bridgeNode).display,
      width: Math.round(rect.width),
      viewportWidth: window.innerWidth,
      bridgeTop: Math.round(rect.top),
      topbarBottom: Math.round(topbarRect?.bottom || 0),
      clearOfTopbar: rect.top >= (topbarRect?.bottom || 0) + 8,
      stickySuppressed: document.querySelector(".mobile-sticky")?.classList.contains("is-suppressed") || false,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      bridgeAfterPrice: bridgeNode.closest("section") === price,
      nextSectionId: nextSection?.id || "",
      heading: bridgeNode.querySelector("h3")?.textContent.trim() || "",
      text: bridgeNode.querySelector("p")?.textContent.trim() || "",
      telegramHref: telegram?.getAttribute("href") || "",
      telegramLocation: telegram?.getAttribute("data-ohtaawa-location") || "",
      telegramMessage: telegram?.getAttribute("data-ohtaawa-clipboard") || "",
      phoneHref: phone?.getAttribute("href") || "",
      phoneLocation: phone?.getAttribute("data-ohtaawa-location") || "",
      formCount: bridgeNode.querySelectorAll("form").length,
      imageCount: bridgeNode.querySelectorAll("img").length,
      actionCount: bridgeNode.querySelectorAll("a").length,
      expectedExperiment
    };
  }, experimentId);

  await page.evaluate(() => {
    document
      .querySelector('.after-price-bridge [data-ohtaawa-event="lead_telegram_polish_film_v8"]')
      .addEventListener("click", event => event.preventDefault(), { capture: true, once: true });
  });
  await page.locator('.after-price-bridge [data-ohtaawa-event="lead_telegram_polish_film_v8"]').click();
  result.telegramEvent = await page.evaluate(expectedExperiment => {
    const events = (window.dataLayer || []).filter(item =>
      item.event_name === "lead_telegram_polish_film_v8" && item.location === "after_price"
    );
    const event = events.at(-1) || {};
    return {
      name: event.event_name || "",
      location: event.location || "",
      destination: event.destination || "",
      experimentId: event.experiment_id || "",
      scenario: event.scenario || "",
      valid:
        event.event_name === "lead_telegram_polish_film_v8" &&
        event.location === "after_price" &&
        event.destination === "telegram" &&
        event.experiment_id === expectedExperiment &&
        event.scenario === "used-car"
    };
  }, experimentId);

  await page.evaluate(() => {
    document
      .querySelector('.after-price-bridge [data-ohtaawa-event="lead_phone_polish_film_v8"]')
      .addEventListener("click", event => event.preventDefault(), { capture: true, once: true });
  });
  await page.locator('.after-price-bridge [data-ohtaawa-event="lead_phone_polish_film_v8"]').click();
  result.phoneEvent = await page.evaluate(expectedExperiment => {
    const events = (window.dataLayer || []).filter(item =>
      item.event_name === "lead_phone_polish_film_v8" && item.location === "after_price"
    );
    const event = events.at(-1) || {};
    return {
      name: event.event_name || "",
      location: event.location || "",
      destination: event.destination || "",
      experimentId: event.experiment_id || "",
      scenario: event.scenario || "",
      valid:
        event.event_name === "lead_phone_polish_film_v8" &&
        event.location === "after_price" &&
        event.destination === "phone" &&
        event.experiment_id === expectedExperiment &&
        event.scenario === "used-car"
    };
  }, experimentId);

  await page.locator("#prices").screenshot({
    path: path.join(proofDir, `${viewport.name}-price-bridge.png`)
  });
  await page.screenshot({
    path: path.join(proofDir, `${viewport.name}-price-bridge-viewport.png`),
    fullPage: false
  });

  result.consoleErrors = consoleErrors;
  result.pageErrors = pageErrors;

  assert.equal(result.experiment, "wave22-polish-proof-first");
  assert.equal(result.experimentId, experimentId);
  assert.equal(result.display, "grid");
  assert.equal(result.clearOfTopbar, true, `${viewport.name}: bridge is obscured by the fixed header`);
  assert.equal(result.stickySuppressed, true, `${viewport.name}: sticky CTA duplicates the local bridge`);
  assert.equal(result.horizontalOverflow, false, `${viewport.name}: horizontal overflow`);
  assert.equal(result.bridgeAfterPrice, true);
  assert.equal(result.nextSectionId, "process");
  assert.equal(result.heading, "Нужен ориентир именно по вашему кузову?");
  assert.match(result.text, /2–3 фото/);
  assert.equal(result.telegramHref, "https://t.me/ohtaawa_chat");
  assert.equal(result.telegramLocation, "after_price");
  assert.match(result.telegramMessage, /Хочу оценить полировку по фото/);
  assert.equal(result.phoneHref, "tel:+78127678840");
  assert.equal(result.phoneLocation, "after_price");
  assert.equal(result.formCount, 0);
  assert.equal(result.imageCount, 0, "The proof image must not be duplicated in the bridge");
  assert.equal(result.actionCount, 2);
  assert.equal(result.telegramEvent.valid, true);
  assert.equal(result.phoneEvent.valid, true);
  assert.deepEqual(result.pageErrors, []);

  await context.close();
  return { viewport, ...result };
}

async function main() {
  fs.mkdirSync(proofDir, { recursive: true });
  const server = createServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}/`;
  const browser = await chromium.launch({ headless: true });
  const report = {
    generatedAt: new Date().toISOString(),
    runId: "ohtaawa-wave27-after-price-cta-2026-07-23",
    baseUrl,
    control: null,
    viewports: []
  };

  try {
    report.control = await inspectControl(browser, baseUrl);
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

  const reportPath = path.join(proofDir, "wave27-qa.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(`${reportPath}\n`);
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
