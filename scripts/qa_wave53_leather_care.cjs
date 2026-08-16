const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const url =
  process.env.OHTAAWA_QA_URL ||
  "http://127.0.0.1:4197/leather-care/?utm_source=codex&utm_medium=qa&utm_campaign=wave53_ya_search_leather_care_3500&scenario=leather_care_fixed_3500&experiment_id=wave53&qa=1";
const outputDir =
  process.env.OHTAAWA_QA_OUTPUT ||
  path.resolve(__dirname, "../proof/wave53-leather-care-20260816");
const chromePath =
  process.env.OHTAAWA_CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const viewports = [
  ["desktop-1440", { width: 1440, height: 900 }],
  ["mobile-430", { width: 430, height: 932 }],
  ["mobile-390", { width: 390, height: 844 }],
  ["mobile-360", { width: 360, height: 800 }],
];
const contactGoals = [
  "lead_phone_leather_care_w53",
  "lead_telegram_leather_care_w53",
  "lead_whatsapp_leather_care_w53",
  "lead_max_leather_care_w53",
];

function startStaticServer() {
  const repoRoot = path.resolve(__dirname, "..");
  const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".js": "text/javascript; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  };
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, "http://127.0.0.1");
    let relativePath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, "");
    if (!relativePath || relativePath.endsWith("/")) relativePath += "index.html";
    const target = path.resolve(repoRoot, relativePath);
    if (!target.startsWith(repoRoot + path.sep)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    fs.readFile(target, (error, body) => {
      if (error) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
        return;
      }
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": contentTypes[path.extname(target).toLowerCase()] || "application/octet-stream",
      });
      response.end(body);
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(4197, "127.0.0.1", () => resolve(server));
  });
}

async function waitForImages(page) {
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
}

async function revealFullPage(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.max(360, Math.floor(page.viewportSize().height * 0.72));
  for (let top = 0; top < height; top += step) {
    await page.evaluate((nextTop) => window.scrollTo({ top: nextTop, behavior: "instant" }), top);
    await page.waitForTimeout(45);
  }
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await page.waitForTimeout(100);
  await waitForImages(page);
}

async function auditViewport(browser, name, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const qaOrigin = new URL(url).origin;
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const errorResponses = [];
  const metrikaRequests = [];
  const externalRequests = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText || "unknown" });
  });
  page.on("request", (request) => {
    const requestUrl = request.url();
    if (/mc\.yandex\.ru\/metrika\/tag\.js|mc\.yandex\.ru\/watch\//.test(requestUrl)) {
      metrikaRequests.push(requestUrl);
    }
    if (!requestUrl.startsWith(qaOrigin) && !requestUrl.startsWith("data:")) {
      externalRequests.push(requestUrl);
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) errorResponses.push({ url: response.url(), status: response.status() });
  });

  await page.addInitScript(() => {
    window.__wave53Vitals = { lcp: 0, cls: 0, longTaskMs: 0 };
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) window.__wave53Vitals.lcp = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__wave53Vitals.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.__wave53Vitals.longTaskMs += entry.duration;
      }).observe({ type: "longtask", buffered: true });
    } catch {}
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.ohtaawaAnalytics));
  await page.waitForFunction(() => {
    const image = document.querySelector(".hero-picture img");
    return Boolean(image?.complete && image.naturalWidth > 0);
  });
  await page.waitForTimeout(750);

  const initialPerformance = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime || 0;
    return {
      fcp: Number(fcp.toFixed(1)),
      ttfb: Number((navigation?.responseStart || 0).toFixed(1)),
      domContentLoaded: Number((navigation?.domContentLoadedEventEnd || 0).toFixed(1)),
      transferBytes: resources.reduce((sum, item) => sum + (item.transferSize || 0), 0),
      encodedBytes: resources.reduce((sum, item) => sum + (item.encodedBodySize || 0), 0),
      resourceCount: resources.length,
      vitals: { ...window.__wave53Vitals },
    };
  });

  const staticChecks = await page.evaluate(() => {
    const visible = (node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
    };
    const labelOf = (node) =>
      node.getAttribute("aria-label") || node.getAttribute("title") || node.textContent.trim();
    const headingLevels = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((node) =>
      Number(node.tagName.slice(1)),
    );
    const headingSkips = headingLevels
      .map((level, index) => ({ from: headingLevels[index - 1], to: level, index }))
      .filter((item) => item.index > 0 && item.to > item.from + 1);
    const heroCta = document.querySelector(".hero [data-open-contact]");
    const heroRect = heroCta?.getBoundingClientRect();
    const targets = [...document.querySelectorAll("[data-open-contact],[data-channel],.round-link")].filter(visible);
    const minTarget = window.innerWidth <= 720 ? 44 : 24;
    return {
      lang: document.documentElement.lang,
      h1Count: document.querySelectorAll("h1").length,
      mainExists: Boolean(document.querySelector("main#main")),
      skipLinkExists: Boolean(document.querySelector('.skip-link[href="#main"]')),
      dialogLabelled: document.getElementById("contact-sheet")?.getAttribute("aria-labelledby") === "contact-title",
      headingSkips,
      unnamedInteractive: [...document.querySelectorAll("a,button,summary")]
        .filter(visible)
        .filter((node) => !labelOf(node))
        .map((node) => node.outerHTML.slice(0, 160)),
      missingAlt: [...document.images]
        .filter((image) => !image.hasAttribute("alt"))
        .map((image) => image.currentSrc || image.src),
      tapTargetFailures: targets
        .map((node) => {
          const rect = node.getBoundingClientRect();
          return { label: labelOf(node), width: Math.round(rect.width), height: Math.round(rect.height) };
        })
        .filter((item) => item.width < minTarget || item.height < minTarget),
      noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
      brokenImages: [...document.images]
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
      heroCtaText: heroCta?.textContent.replace(/\s+/g, " ").trim() || "",
      heroCtaInFirstViewport: Boolean(
        heroRect &&
          heroRect.top >= 0 &&
          heroRect.bottom <= window.innerHeight &&
          heroRect.left >= 0 &&
          heroRect.right <= window.innerWidth,
      ),
      heroDirectChannelCount: document.querySelectorAll(".hero [data-channel]").length,
      openContactCount: document.querySelectorAll("[data-open-contact]").length,
      contactChannelCount: document.querySelectorAll("[data-channel]").length,
      priceText: document.querySelector(".hero-price strong")?.textContent.trim() || "",
      offerTitle: document.querySelector("h1")?.textContent.replace(/\s+/g, " ").trim() || "",
      bodyRoute: document.body.dataset.route,
      counterData: document.body.dataset.ohtaawaMetricaCounterIds,
      config: window.ohtaawaAnalytics?.config,
      attribution: window.ohtaawaAnalytics?.attribution,
      isQa: window.ohtaawaAnalytics?.isQa,
      mapHasSrc: Boolean(document.querySelector("[data-map-src]")?.src),
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    };
  });

  await page.screenshot({ path: path.join(outputDir, name + "-hero.png") });
  await page.evaluate(() => {
    window.__wave53Observed = [];
    window.addEventListener("ohtaawa:track", (event) => window.__wave53Observed.push(event.detail));
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-channel]")) event.preventDefault();
    }, true);
  });

  await page.locator(".hero [data-open-contact]").focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.getElementById("contact-sheet")?.open === true);
  const dialogFocusContained = await page.evaluate(() =>
    document.getElementById("contact-sheet")?.contains(document.activeElement),
  );
  await page.locator("#contact-sheet .contact-sheet-inner").screenshot({
    path: path.join(outputDir, name + "-contact.png"),
  });
  for (const channel of ["telegram", "whatsapp", "max", "phone"]) {
    await page.locator('[data-channel="' + channel + '"]').click();
  }
  await page.waitForTimeout(120);
  const contactState = await page.evaluate(() => ({
    whatsappHref: document.querySelector('[data-channel="whatsapp"]')?.href || "",
  }));
  await page.locator("[data-close-contact]").click();

  await revealFullPage(page);
  await page.screenshot({ path: path.join(outputDir, name + "-full.png"), fullPage: true });
  const faq = page.locator(".faq-list details").first();
  await faq.locator("summary").click();
  const faqOpen = await faq.evaluate((node) => node.open);

  const finalChecks = await page.evaluate(() => ({
    noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
    brokenImages: [...document.images]
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
    observed: window.__wave53Observed || [],
    qaEvents: window.ohtaawaAnalytics?.qaEvents || [],
    vitals: { ...window.__wave53Vitals },
  }));

  const observedNames = finalChecks.observed.map((item) => item.event);
  const requiredObserved = [
    "contact_sheet_open_leather_care_w53",
    "contact_channel_click_leather_care_w53",
    ...contactGoals,
    "offer_terms_view_leather_care_w53",
    "trust_view_leather_care_w53",
    "process_view_leather_care_w53",
    "landing_scroll_50_leather_care_w53",
    "landing_scroll_90_leather_care_w53",
  ];
  const sameOriginErrors = errorResponses.filter((item) => item.url.startsWith(qaOrigin));
  const sameOriginFailures = failedRequests.filter((item) => item.url.startsWith(qaOrigin));
  const report = {
    name,
    viewport,
    staticChecks,
    dialogFocusContained,
    faqOpen,
    tracking: {
      observedNames,
      qaEventNames: finalChecks.qaEvents.map((item) => item.event),
      missingObserved: requiredObserved.filter((event) => !observedNames.includes(event)),
      whatsappPrefillPresent:
        contactState.whatsappHref.includes("text=") &&
        decodeURIComponent(contactState.whatsappHref).includes("3 500 ₽"),
    },
    network: {
      metrikaRequests,
      externalRequests: [...new Set(externalRequests)],
      sameOriginErrors,
      sameOriginFailures,
    },
    performance: { initial: initialPerformance, finalVitals: finalChecks.vitals },
    finalChecks,
    consoleErrors,
    pageErrors,
  };

  report.pass =
    staticChecks.lang === "ru" &&
    staticChecks.h1Count === 1 &&
    staticChecks.mainExists &&
    staticChecks.skipLinkExists &&
    staticChecks.dialogLabelled &&
    staticChecks.headingSkips.length === 0 &&
    staticChecks.unnamedInteractive.length === 0 &&
    staticChecks.missingAlt.length === 0 &&
    staticChecks.tapTargetFailures.length === 0 &&
    staticChecks.noHorizontalOverflow &&
    finalChecks.noHorizontalOverflow &&
    staticChecks.brokenImages.length === 0 &&
    finalChecks.brokenImages.length === 0 &&
    staticChecks.heroCtaText.includes("Узнать ближайшее время") &&
    staticChecks.heroCtaInFirstViewport &&
    staticChecks.heroDirectChannelCount === 0 &&
    staticChecks.openContactCount === 5 &&
    staticChecks.contactChannelCount === 4 &&
    staticChecks.priceText === "3 500 ₽" &&
    staticChecks.offerTitle.includes("Чистка кожи") &&
    staticChecks.offerTitle.includes("кондиционер Koch") &&
    staticChecks.bodyRoute === "leather_care" &&
    staticChecks.counterData === "110584673" &&
    staticChecks.config?.metrikaCounter === 110584673 &&
    staticChecks.config?.landingVersion === "wave53-leather-care-v1" &&
    staticChecks.config?.experimentId === "wave53" &&
    staticChecks.attribution?.utm_campaign === "wave53_ya_search_leather_care_3500" &&
    staticChecks.attribution?.scenario === "leather_care_fixed_3500" &&
    staticChecks.attribution?.experiment_id === "wave53" &&
    staticChecks.isQa === true &&
    staticChecks.mapHasSrc === false &&
    staticChecks.reducedMotion === true &&
    dialogFocusContained &&
    faqOpen &&
    report.tracking.missingObserved.length === 0 &&
    report.tracking.whatsappPrefillPresent &&
    metrikaRequests.length === 0 &&
    report.network.externalRequests.length === 0 &&
    sameOriginErrors.length === 0 &&
    sameOriginFailures.length === 0 &&
    initialPerformance.vitals.lcp <= 2500 &&
    initialPerformance.vitals.cls <= 0.1 &&
    initialPerformance.fcp <= 1800 &&
    initialPerformance.transferBytes <= 850 * 1024 &&
    consoleErrors.length === 0 &&
    pageErrors.length === 0;

  await context.close();
  return report;
}

async function auditNonQaMapping(browser) {
  const productionLikeUrl =
    "http://go.detailingspb.ru:4197/leather-care/?utm_source=yandex&utm_medium=cpc&utm_campaign=wave53_ya_search_leather_care_3500&scenario=leather_care_fixed_3500&experiment_id=wave53";
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const metrikaRequests = [];
  await page.route("http://go.detailingspb.ru:4197/**", async (route) => {
    const requestUrl = new URL(route.request().url());
    let relativePath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, "");
    if (!relativePath || relativePath.endsWith("/")) relativePath += "index.html";
    const target = path.resolve(__dirname, "..", relativePath);
    const contentTypes = {
      ".css": "text/css; charset=utf-8",
      ".html": "text/html; charset=utf-8",
      ".ico": "image/x-icon",
      ".js": "text/javascript; charset=utf-8",
      ".png": "image/png",
      ".webp": "image/webp",
    };
    if (!fs.existsSync(target)) {
      await route.fulfill({ status: 404, body: "Not found" });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: contentTypes[path.extname(target).toLowerCase()] || "application/octet-stream",
      body: fs.readFileSync(target),
    });
  });
  await page.route("https://mc.yandex.ru/metrika/tag.js", async (route) => {
    metrikaRequests.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "text/javascript", body: "/* intercepted in local QA */" });
  });
  await page.goto(productionLikeUrl, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.ohtaawaAnalytics));
  await page.evaluate(() => {
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-channel]")) event.preventDefault();
    }, true);
  });
  await page.locator(".hero [data-open-contact]").click();
  await page.locator('[data-channel="whatsapp"]').click();
  const state = await page.evaluate(() => ({
    isQa: window.ohtaawaAnalytics?.isQa,
    attribution: window.ohtaawaAnalytics?.attribution,
    ymCalls: window.ym?.a || [],
  }));
  const reachGoalCalls = state.ymCalls.filter((call) => call[1] === "reachGoal");
  const goalNames = reachGoalCalls.map((call) => call[2]);
  const counters = [...new Set(state.ymCalls.map((call) => call[0]).filter(Number.isFinite))];
  const landingPayload = reachGoalCalls.find((call) => call[2] === "landing_view_leather_care_w53")?.[3];
  const report = {
    pass:
      state.isQa === false &&
      metrikaRequests.length === 1 &&
      counters.length === 1 &&
      counters[0] === 110584673 &&
      goalNames.includes("landing_view_leather_care_w53") &&
      goalNames.includes("contact_sheet_open_leather_care_w53") &&
      goalNames.includes("contact_channel_click_leather_care_w53") &&
      goalNames.includes("lead_whatsapp_leather_care_w53") &&
      landingPayload?.utm_source === "yandex" &&
      landingPayload?.utm_medium === "cpc" &&
      landingPayload?.utm_campaign === "wave53_ya_search_leather_care_3500" &&
      landingPayload?.scenario === "leather_care_fixed_3500" &&
      landingPayload?.experiment_id === "wave53" &&
      landingPayload?.service_route === "leather_care" &&
      landingPayload?.offer_id === "leather_care_koch_fixed_3500",
    isQa: state.isQa,
    metrikaRequests,
    counters,
    goalNames,
    landingPayload,
  };
  await context.close();
  return report;
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  const server = await startStaticServer();
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
    args: ["--host-resolver-rules=MAP go.detailingspb.ru 127.0.0.1"],
  });
  try {
    const reports = [];
    for (const [name, viewport] of viewports) reports.push(await auditViewport(browser, name, viewport));
    const nonQaMapping = await auditNonQaMapping(browser);
    const result = { pass: reports.every((report) => report.pass) && nonQaMapping.pass, url, reports, nonQaMapping };
    fs.writeFileSync(path.join(outputDir, "qa.json"), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({
      pass: result.pass,
      nonQaMapping: {
        pass: nonQaMapping.pass,
        isQa: nonQaMapping.isQa,
        counters: nonQaMapping.counters,
        goalNames: nonQaMapping.goalNames,
      },
      reports: reports.map((report) => ({
        name: report.name,
        pass: report.pass,
        overflow: !report.staticChecks.noHorizontalOverflow || !report.finalChecks.noHorizontalOverflow,
        heroCtaInFirstViewport: report.staticChecks.heroCtaInFirstViewport,
        brokenImages: report.finalChecks.brokenImages,
        tapTargetFailures: report.staticChecks.tapTargetFailures,
        missingObserved: report.tracking.missingObserved,
        metrikaRequests: report.network.metrikaRequests.length,
        externalRequests: report.network.externalRequests.length,
        fcp: report.performance.initial.fcp,
        lcp: report.performance.initial.vitals.lcp,
        cls: report.performance.initial.vitals.cls,
        transferBytes: report.performance.initial.transferBytes,
        consoleErrors: report.consoleErrors,
        pageErrors: report.pageErrors,
      })),
    }, null, 2));
    if (!result.pass) process.exitCode = 1;
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
