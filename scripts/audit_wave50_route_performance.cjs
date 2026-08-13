const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const baseUrl = process.env.OHTAAWA_BASE_URL || "http://127.0.0.1:4195";
const outputPath =
  process.env.OHTAAWA_PERFORMANCE_OUTPUT ||
  path.resolve(__dirname, "../proof/wave50-cro-audit-20260814/route-performance.json");
const chromePath =
  process.env.OHTAAWA_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const routes = [
  ["root-180k", "/", "full-film"],
  ["risk-zones-60k", "/risk-zones/", "risk-zones"],
  ["color-film-230k", "/color-film/", "color-film"],
];
const viewports = [
  ["desktop-1440", { width: 1440, height: 900 }],
  ["mobile-390", { width: 390, height: 844 }],
];

async function audit(browser, routeName, routePath, scenario, viewportName, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  const mainFrameMetrika = [];
  const consoleErrors = [];
  const pageErrors = [];
  const sameOriginErrors = [];
  const url = `${baseUrl}${routePath}?utm_source=codex&utm_medium=qa&utm_campaign=wave50_route_audit_qa&scenario=${scenario}&experiment_id=wave50_route_audit_qa`;

  page.on("request", (request) => {
    if (
      request.frame() === page.mainFrame() &&
      /mc\.yandex\.ru\/metrika\/tag\.js|mc\.yandex\.ru\/watch\//.test(request.url())
    ) {
      mainFrameMetrika.push(request.url());
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => {
    if (response.url().startsWith(baseUrl) && response.status() >= 400) {
      sameOriginErrors.push({ url: response.url(), status: response.status() });
    }
  });

  await page.addInitScript(() => {
    window.__routeVitals = { lcp: 0, cls: 0 };
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) window.__routeVitals.lcp = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__routeVitals.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {}
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.ohtaawaAnalytics));
  await page.waitForTimeout(900);

  const collectPerformance = () =>
    page.evaluate(() => {
      const resources = performance.getEntriesByType("resource");
      return {
        transferBytes: resources.reduce((sum, item) => sum + (item.transferSize || 0), 0),
        encodedBytes: resources.reduce((sum, item) => sum + (item.encodedBodySize || 0), 0),
        resourceCount: resources.length,
        fcp: performance.getEntriesByName("first-contentful-paint")[0]?.startTime || 0,
        vitals: { ...window.__routeVitals },
      };
    });

  const initial = await collectPerformance();
  await page.evaluate(() => {
    document.querySelectorAll("img").forEach((image) => {
      image.loading = "eager";
    });
  });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.max(360, Math.floor(viewport.height * 0.72));
  for (let top = 0; top < height; top += step) {
    await page.evaluate((nextTop) => window.scrollTo({ top: nextTop, behavior: "instant" }), top);
    await page.waitForTimeout(45);
  }
  await page.evaluate(async () => {
    await Promise.all(
      [...document.images].map(
        (image) =>
          new Promise((resolve) => {
            if (image.complete) return resolve();
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          }),
      ),
    );
  });
  await page.waitForTimeout(250);
  const full = await collectPerformance();
  const staticChecks = await page.evaluate(() => ({
    isQa: window.ohtaawaAnalytics?.isQa,
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
    brokenImages: [...document.images]
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
    unnamedButtons: [...document.querySelectorAll("button")]
      .filter((button) => !(button.getAttribute("aria-label") || button.getAttribute("title") || button.textContent.trim()))
      .length,
  }));

  const report = {
    routeName,
    viewportName,
    initial,
    full,
    staticChecks,
    mainFrameMetrikaRequests: mainFrameMetrika.length,
    sameOriginErrors,
    consoleErrors,
    pageErrors,
  };
  report.pass =
    staticChecks.isQa === true &&
    staticChecks.noHorizontalOverflow &&
    staticChecks.brokenImages.length === 0 &&
    staticChecks.unnamedButtons === 0 &&
    mainFrameMetrika.length === 0 &&
    sameOriginErrors.length === 0 &&
    consoleErrors.length === 0 &&
    pageErrors.length === 0 &&
    initial.transferBytes <= 3 * 1024 * 1024 &&
    full.transferBytes <= 6 * 1024 * 1024 &&
    initial.fcp <= 1800 &&
    initial.vitals.lcp <= 2500 &&
    initial.vitals.cls <= 0.1;

  await context.close();
  return report;
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  try {
    const reports = [];
    for (const [routeName, routePath, scenario] of routes) {
      for (const [viewportName, viewport] of viewports) {
        reports.push(await audit(browser, routeName, routePath, scenario, viewportName, viewport));
      }
    }
    const result = { pass: reports.every((report) => report.pass), baseUrl, reports };
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(JSON.stringify({
      pass: result.pass,
      reports: reports.map((report) => ({
        route: report.routeName,
        viewport: report.viewportName,
        pass: report.pass,
        initialKB: Math.round(report.initial.transferBytes / 1024),
        fullKB: Math.round(report.full.transferBytes / 1024),
        fcpMs: Math.round(report.initial.fcp),
        lcpMs: Math.round(report.initial.vitals.lcp),
        cls: Number(report.initial.vitals.cls.toFixed(4)),
      })),
    }, null, 2));
    if (!result.pass) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
