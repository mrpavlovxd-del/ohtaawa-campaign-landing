const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const url =
  process.env.OHTAAWA_QA_URL ||
  "http://127.0.0.1:4195/question-first/?utm_source=codex&utm_medium=qa&utm_campaign=wave50_question_first_qa&scenario=full-film&experiment_id=wave50_question_first_qa";
const outputDir =
  process.env.OHTAAWA_QA_OUTPUT ||
  path.resolve(__dirname, "../proof/wave50-cro-audit-20260814/candidate");
const chromePath =
  process.env.OHTAAWA_CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const viewports = [
  ["desktop-1440", { width: 1440, height: 900 }],
  ["mobile-430", { width: 430, height: 932 }],
  ["mobile-390", { width: 390, height: 844 }],
  ["mobile-360", { width: 360, height: 800 }],
];

const canonicalContactGoals = [
  "lead_phone_polish_film_v8",
  "lead_telegram_polish_film_v8",
  "lead_whatsapp_polish_film_v8",
  "lead_max_direct_polish_film_v8",
];

async function waitForImages(page) {
  await page.evaluate(async () => {
    const images = [...document.images];
    await Promise.all(
      images.map(
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
    await page.waitForTimeout(55);
  }
  await waitForImages(page);
}

async function auditViewport(browser, name, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });

  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const errorResponses = [];
  const metrikaRequests = [];
  const thirdPartyMetrikaRequests = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText || "unknown" });
  });
  page.on("request", (request) => {
    if (/mc\.yandex\.ru\/metrika\/tag\.js|mc\.yandex\.ru\/watch\//.test(request.url())) {
      if (request.frame() === page.mainFrame()) metrikaRequests.push(request.url());
      else thirdPartyMetrikaRequests.push(request.url());
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) errorResponses.push({ url: response.url(), status: response.status() });
  });

  await page.addInitScript(() => {
    window.__wave50Vitals = { lcp: 0, cls: 0, inp: 0, longTaskMs: 0 };
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) window.__wave50Vitals.lcp = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__wave50Vitals.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.interactionId) window.__wave50Vitals.inp = Math.max(window.__wave50Vitals.inp, entry.duration);
        }
      }).observe({ type: "event", buffered: true, durationThreshold: 16 });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.__wave50Vitals.longTaskMs += entry.duration;
      }).observe({ type: "longtask", buffered: true });
    } catch {}
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.ohtaawaAnalytics));
  await page.waitForFunction(() => {
    const heroImage = document.querySelector(".hero img");
    return Boolean(heroImage?.complete && heroImage.naturalWidth > 0);
  });
  await page.waitForTimeout(900);

  const initialPerformance = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource").map((entry) => ({
      name: entry.name,
      initiatorType: entry.initiatorType,
      transferSize: entry.transferSize || 0,
      encodedBodySize: entry.encodedBodySize || 0,
      duration: Number(entry.duration.toFixed(1)),
    }));
    const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime || 0;
    return {
      fcp: Number(fcp.toFixed(1)),
      ttfb: Number((navigation?.responseStart || 0).toFixed(1)),
      domContentLoaded: Number((navigation?.domContentLoadedEventEnd || 0).toFixed(1)),
      transferBytes: resources.reduce((sum, item) => sum + item.transferSize, 0),
      encodedBytes: resources.reduce((sum, item) => sum + item.encodedBodySize, 0),
      resourceCount: resources.length,
      resources,
      vitals: { ...window.__wave50Vitals },
    };
  });

  const staticChecks = await page.evaluate(() => {
    const visible = (node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    };
    const labelOf = (node) =>
      node.getAttribute("aria-label") || node.getAttribute("title") || node.textContent.trim();
    const parseRgb = (value) => {
      const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return match ? match.slice(1).map(Number) : null;
    };
    const luminance = (rgb) => {
      const values = rgb.map((value) => {
        const channel = value / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
    };
    const contrast = (foreground, background) => {
      const fg = parseRgb(foreground);
      const bg = parseRgb(background);
      if (!fg || !bg) return 0;
      const light = Math.max(luminance(fg), luminance(bg));
      const dark = Math.min(luminance(fg), luminance(bg));
      return Number(((light + 0.05) / (dark + 0.05)).toFixed(2));
    };

    const heroCta = document.querySelector(".hero [data-open-contact]");
    const heroRect = heroCta?.getBoundingClientRect();
    const heroStyle = heroCta ? getComputedStyle(heroCta) : null;
    const headingLevels = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((node) =>
      Number(node.tagName.slice(1)),
    );
    const headingSkips = headingLevels
      .map((level, index) => ({ from: headingLevels[index - 1], to: level, index }))
      .filter((item) => item.index > 0 && item.to > item.from + 1);
    const unnamedInteractive = [...document.querySelectorAll("a,button,input,select,textarea")]
      .filter(visible)
      .filter((node) => !labelOf(node))
      .map((node) => node.outerHTML.slice(0, 180));
    const missingAlt = [...document.images]
      .filter((image) => !image.hasAttribute("alt"))
      .map((image) => image.currentSrc || image.src);
    const minimumTarget = window.innerWidth < 720 ? 44 : 24;
    const tapTargetFailures = [...document.querySelectorAll("[data-open-contact],[data-channel]")]
      .filter(visible)
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return { label: labelOf(node), width: Math.round(rect.width), height: Math.round(rect.height) };
      })
      .filter((item) => item.width < minimumTarget || item.height < minimumTarget);

    return {
      lang: document.documentElement.lang,
      title: document.title,
      h1Count: document.querySelectorAll("h1").length,
      mainExists: Boolean(document.querySelector("main#main")),
      skipLinkExists: Boolean(document.querySelector('.skip-link[href="#main"]')),
      dialogLabelled: document.getElementById("contact-sheet")?.getAttribute("aria-labelledby") === "contact-title",
      headingSkips,
      unnamedInteractive,
      missingAlt,
      tapTargetFailures,
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
      brokenImages: [...document.images]
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
      intentCtaCount: document.querySelectorAll('[data-track-event="contact_intent_open_question_first_v1"]').length,
      heroDirectChannelCount: document.querySelectorAll(".hero [data-channel]").length,
      heroCtaText: heroCta?.textContent.trim() || "",
      heroCtaInFirstViewport: Boolean(
        heroRect && heroRect.top >= 0 && heroRect.bottom <= window.innerHeight && heroRect.left >= 0 && heroRect.right <= window.innerWidth,
      ),
      heroCtaContrast: heroStyle ? contrast(heroStyle.color, heroStyle.backgroundColor) : 0,
      priceText: document.querySelector(".hero-price strong")?.textContent.trim() || "",
      offerTitle: document.querySelector("h1")?.textContent.replace(/\s+/g, " ").trim() || "",
      config: window.ohtaawaAnalytics?.config,
      isQa: window.ohtaawaAnalytics?.isQa,
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    };
  });

  await page.screenshot({ path: path.join(outputDir, `${name}-hero.png`) });

  await page.evaluate(() => {
    window.__wave50Observed = [];
    window.addEventListener("ohtaawa:track", (event) => window.__wave50Observed.push(event.detail));
    document.addEventListener(
      "click",
      (event) => {
        if (event.target.closest("[data-channel]")) event.preventDefault();
      },
      true,
    );
  });

  const heroCta = page.locator(".hero [data-open-contact]");
  await heroCta.focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.getElementById("contact-sheet")?.open === true);
  const dialogFocusContained = await page.evaluate(() =>
    document.getElementById("contact-sheet")?.contains(document.activeElement),
  );
  await page.evaluate(() => {
    const toast = document.querySelector("[data-toast]");
    toast?.classList.remove("is-visible");
    if (toast) toast.textContent = "";
  });
  await page.locator("#contact-sheet .contact-sheet-inner").screenshot({
    path: path.join(outputDir, `${name}-contact.png`),
  });

  for (const channel of ["telegram", "whatsapp", "max", "phone"]) {
    await page.locator(`[data-channel="${channel}"]`).click();
  }
  await page.waitForTimeout(120);
  const tracking = await page.evaluate(() => ({
    observed: window.__wave50Observed || [],
    qaEvents: window.ohtaawaAnalytics?.qaEvents || [],
  }));
  await page.locator("[data-close-contact]").click();

  await revealFullPage(page);
  const proof = page.locator("#proof");
  await proof.scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  await proof.screenshot({ path: path.join(outputDir, `${name}-proof.png`) });

  const scopePrice = page.locator(".scope-price");
  await scopePrice.scrollIntoViewIfNeeded();
  await page.waitForTimeout(80);
  await scopePrice.screenshot({ path: path.join(outputDir, `${name}-scope-price.png`) });

  const carouselBefore = await page.locator("[data-carousel-main]").evaluate((image) => image.currentSrc);
  await page.locator("[data-carousel-next]").click();
  await page.waitForTimeout(100);
  const carouselAfter = await page.locator("[data-carousel-main]").evaluate((image) => image.currentSrc);
  await page.locator("[data-carousel-open]").click();
  const galleryOpen = await page.locator("#gallery-dialog").evaluate((dialog) => dialog.open);
  await page.locator("[data-gallery-close]").click();
  const faq = page.locator(".faq-list details").first();
  await faq.locator("summary").click();
  const faqOpen = await faq.evaluate((node) => node.open);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  if (process.env.OHTAAWA_CAPTURE_FULL === "1" && (name === "desktop-1440" || name === "mobile-390")) {
    await page.screenshot({ path: path.join(outputDir, `${name}-full.png`), fullPage: true });
  }

  const finalPerformance = await page.evaluate(() => {
    const resources = performance.getEntriesByType("resource").map((entry) => ({
      name: entry.name,
      initiatorType: entry.initiatorType,
      transferSize: entry.transferSize || 0,
      encodedBodySize: entry.encodedBodySize || 0,
      duration: Number(entry.duration.toFixed(1)),
    }));
    return {
      transferBytes: resources.reduce((sum, item) => sum + item.transferSize, 0),
      encodedBytes: resources.reduce((sum, item) => sum + item.encodedBodySize, 0),
      resourceCount: resources.length,
      resources,
      brokenImages: [...document.images]
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
      vitals: { ...window.__wave50Vitals },
    };
  });

  const observedNames = tracking.observed.map((item) => item.event);
  const qaEventNames = tracking.qaEvents.map((item) => item.event);
  const sameOriginErrors = errorResponses.filter((item) => item.url.startsWith(new URL(url).origin));
  const sameOriginFailures = failedRequests.filter((item) => item.url.startsWith(new URL(url).origin));
  const requiredObserved = [
    "contact_intent_open_question_first_v1",
    "contact_sheet_open",
    "contact_channel_click",
    ...canonicalContactGoals,
  ];

  const report = {
    name,
    viewport,
    staticChecks,
    dialogFocusContained,
    tracking: {
      observedNames,
      qaEventNames,
      missingObserved: requiredObserved.filter((event) => !observedNames.includes(event)),
      qaMetrikaRequests: metrikaRequests,
      thirdPartyMapMetrikaRequestCount: thirdPartyMetrikaRequests.length,
    },
    interactions: {
      carouselChanged: carouselBefore !== carouselAfter,
      galleryOpen,
      faqOpen,
    },
    network: {
      sameOriginErrors,
      sameOriginFailures,
      externalErrorResponses: errorResponses.filter((item) => !item.url.startsWith(new URL(url).origin)),
      externalFailedRequests: failedRequests.filter((item) => !item.url.startsWith(new URL(url).origin)),
    },
    performance: { initial: initialPerformance, fullPage: finalPerformance },
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
    staticChecks.brokenImages.length === 0 &&
    finalPerformance.brokenImages.length === 0 &&
    staticChecks.intentCtaCount === 5 &&
    staticChecks.heroDirectChannelCount === 0 &&
    staticChecks.heroCtaText.includes("Задать вопрос по автомобилю") &&
    staticChecks.heroCtaInFirstViewport &&
    staticChecks.heroCtaContrast >= 4.5 &&
    staticChecks.priceText === "180 000 ₽" &&
    staticChecks.config?.landingVersion === "wave50-question-first" &&
    staticChecks.config?.experimentId === "wave50_question_first" &&
    staticChecks.isQa === true &&
    staticChecks.reducedMotion === true &&
    dialogFocusContained &&
    report.tracking.missingObserved.length === 0 &&
    metrikaRequests.length === 0 &&
    report.interactions.carouselChanged &&
    report.interactions.galleryOpen &&
    report.interactions.faqOpen &&
    sameOriginErrors.length === 0 &&
    sameOriginFailures.length === 0 &&
    initialPerformance.vitals.lcp <= 2500 &&
    initialPerformance.vitals.cls <= 0.1 &&
    initialPerformance.fcp <= 1800 &&
    initialPerformance.transferBytes <= 2 * 1024 * 1024 &&
    finalPerformance.transferBytes <= 5 * 1024 * 1024 &&
    consoleErrors.length === 0 &&
    pageErrors.length === 0;

  await context.close();
  return report;
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  try {
    const reports = [];
    for (const [name, viewport] of viewports) reports.push(await auditViewport(browser, name, viewport));
    const result = { pass: reports.every((report) => report.pass), url, reports };
    fs.writeFileSync(path.join(outputDir, "qa.json"), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({
      pass: result.pass,
      url,
      reports: reports.map((report) => ({
        name: report.name,
        pass: report.pass,
        overflow: !report.staticChecks.noHorizontalOverflow,
        brokenImages: report.performance.fullPage.brokenImages.length,
        missingEvents: report.tracking.missingObserved,
        metrikaRequests: report.tracking.qaMetrikaRequests.length,
        consoleErrors: report.consoleErrors.length,
        sameOriginNetworkErrors: report.network.sameOriginErrors.length + report.network.sameOriginFailures.length,
        initialKB: Math.round(report.performance.initial.transferBytes / 1024),
        fullPageKB: Math.round(report.performance.fullPage.transferBytes / 1024),
        fcpMs: report.performance.initial.fcp,
        lcpMs: Number(report.performance.initial.vitals.lcp.toFixed(1)),
        cls: Number(report.performance.initial.vitals.cls.toFixed(4)),
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
