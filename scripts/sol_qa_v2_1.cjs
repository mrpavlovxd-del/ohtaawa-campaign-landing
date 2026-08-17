"use strict";

const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const QA_VERSION = "v2.3";
const QA_EXPERIMENT_ID = "qwen_v2_3_sol_qa";
const OUTPUT_SLUG = "sol-qa-v2-3";
const OUTPUT_DIR = path.join(ROOT, "artifacts", OUTPUT_SLUG);
const REPORT_PATH = path.join(OUTPUT_DIR, `${OUTPUT_SLUG}-report.json`);
const VIEWPORTS = [
  { id: "desktop-1440x1000", width: 1440, height: 1000 },
  { id: "mobile-430x932", width: 430, height: 932 },
  { id: "mobile-390x844", width: 390, height: 844 },
  { id: "mobile-360x800", width: 360, height: 800 },
];
const MOBILE_ACCESSIBLE_NAME_WIDTHS = new Set([430, 390, 360]);
const RETAINED_PROOF_FILENAMES = Object.freeze([
  "finished-porsche-wide.webp",
  "film-sheet-wide.webp",
  "gloss-front-wide.webp",
]);
const SECONDARY_PROOF_FILENAMES = Object.freeze(RETAINED_PROOF_FILENAMES.slice(1));
const BLOCKED_PROOF_FILENAMES = Object.freeze([
  "gloss-panel-wide.webp",
  "film-edge-process-wide.webp",
  "full-body-disassembly-wide.webp",
]);
const RESPONSIVE_CONTACT_TARGETS = Object.freeze([
  {
    id: "header-phone",
    selector: "header a[href^='tel:'][data-contact-location='header']",
  },
  {
    id: "hero-telegram",
    selector: "a[data-contact-location='hero'][data-channel='telegram']",
  },
  {
    id: "hero-whatsapp",
    selector: "a[data-contact-location='hero'][data-channel='whatsapp']",
  },
  {
    id: "hero-phone",
    selector: "a[data-contact-location='hero'][data-channel='phone']",
  },
]);

const CANONICAL = {
  view: [
    "price_view_polish_film_v9",
    "proof_view_polish_film_v9",
    "offer_terms_view_polish_film_v8",
  ],
  scroll: [
    "landing_scroll_50_polish_film_v8",
    "landing_scroll_90_polish_film_v8",
  ],
  channel: {
    phone: "lead_phone_polish_film_v8",
    telegram: "lead_telegram_polish_film_v8",
    whatsapp: "lead_whatsapp_polish_film_v8",
    max: "lead_max_direct_polish_film_v8",
  },
  route: [
    "route_main_site_v8",
    "route_telegram_channel_v8",
    "route_yandex_maps_v8",
    "route_yandex_reviews_v8",
  ],
};

const report = {
  schema: "ohtaawa-sol-browser-qa-v2.3/1",
  baseline: { runner: "sol_qa_v2_1.cjs", existingChecks: 77 },
  startedAt: new Date().toISOString(),
  finishedAt: null,
  root: ".",
  server: null,
  source: {},
  screenshots: [],
  checks: [],
  metrikaRequests: [],
  summary: null,
};

let serverHandle = null;
let browser = null;

function addCheck(group, id, pass, details = {}) {
  const entry = {
    group,
    id,
    pass: Boolean(pass),
    details,
  };
  report.checks.push(entry);
  return entry.pass;
}

function safeText(value, max = 500) {
  return String(value == null ? "" : value).replace(/\s+/g, " ").trim().slice(0, max);
}

function isLocalHostname(hostname) {
  const host = String(hostname || "").toLowerCase();
  return host === "127.0.0.1" || host === "localhost" || host === "[::1]" || host === "::1";
}

function prepareOutput() {
  const expectedParent = path.join(ROOT, "artifacts") + path.sep;
  const resolved = path.resolve(OUTPUT_DIR);
  if (!resolved.startsWith(expectedParent) || path.basename(resolved) !== OUTPUT_SLUG) {
    throw new Error(`Unsafe QA output path: ${resolved}`);
  }
  fs.rmSync(resolved, { recursive: true, force: true });
  fs.mkdirSync(resolved, { recursive: true });
}

function sourceFingerprint(relativePath) {
  const absolute = path.join(ROOT, relativePath);
  const data = fs.readFileSync(absolute);
  return {
    path: relativePath.replace(/\\/g, "/"),
    bytes: data.length,
    sha256: crypto.createHash("sha256").update(data).digest("hex"),
  };
}

function runStaticV23Contracts() {
  const productSources = [
    "index.html",
    path.join("assets", "qwen-full-film.css"),
    path.join("assets", "qwen-full-film.js"),
  ];
  const hits = [];
  for (const relativePath of productSources) {
    const source = fs.readFileSync(path.join(ROOT, relativePath), "utf8").toLowerCase();
    for (const filename of BLOCKED_PROOF_FILENAMES) {
      if (source.includes(filename.toLowerCase())) {
        hits.push({ path: relativePath.replace(/\\/g, "/"), filename });
      }
    }
  }
  addCheck("proof", "v2.3.blocked-proof-filenames-absent", hits.length === 0, {
    blocked: BLOCKED_PROOF_FILENAMES,
    hits,
    scanned: productSources.map((item) => item.replace(/\\/g, "/")),
  });
}

function writeReport() {
  report.finishedAt = new Date().toISOString();
  const failed = report.checks.filter((item) => !item.pass);
  report.summary = {
    pass: failed.length === 0,
    total: report.checks.length,
    passed: report.checks.length - failed.length,
    failed: failed.length,
    failedIds: failed.map((item) => item.id),
  };
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function contentType(filePath) {
  const types = {
    ".avif": "image/avif",
    ".css": "text/css; charset=utf-8",
    ".gif": "image/gif",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml; charset=utf-8",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  };
  return types[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

async function createStaticServer() {
  const supplied = process.env.SOL_QA_BASE_URL;
  if (supplied) {
    const parsed = new URL(supplied);
    if (parsed.protocol !== "http:" || !isLocalHostname(parsed.hostname)) {
      throw new Error("SOL_QA_BASE_URL must point to an HTTP localhost/loopback server");
    }
    return {
      mode: "attached",
      baseUrl: parsed.toString(),
      close: async () => {},
    };
  }

  const server = http.createServer((request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    } catch (_error) {
      response.writeHead(400);
      response.end("Bad request");
      return;
    }

    const relative = pathname === "/" ? "index.html" : pathname.replace(/^[/\\]+/, "");
    let filePath = path.resolve(ROOT, relative);
    const rootPrefix = ROOT + path.sep;
    if (filePath !== ROOT && !filePath.startsWith(rootPrefix)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    try {
      if (fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, "index.html");
      const data = fs.readFileSync(filePath);
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Length": data.length,
        "Content-Type": contentType(filePath),
      });
      if (request.method === "HEAD") response.end();
      else response.end(data);
    } catch (_error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return {
    mode: "started",
    baseUrl: `http://127.0.0.1:${address.port}/`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

async function launchBrowser() {
  const executablePath = process.env.SOL_QA_CHROME_PATH;
  if (executablePath) {
    if (!fs.existsSync(executablePath)) throw new Error(`SOL_QA_CHROME_PATH does not exist: ${executablePath}`);
    return chromium.launch({ headless: true, executablePath });
  }
  try {
    return await chromium.launch({ headless: true });
  } catch (bundledError) {
    try {
      return await chromium.launch({ headless: true, channel: "chrome" });
    } catch (chromeError) {
      throw new Error(`Unable to launch Playwright Chromium or installed Chrome: ${bundledError.message}; ${chromeError.message}`);
    }
  }
}

function qaUrl(params = {}) {
  const url = new URL(serverHandle.baseUrl);
  const defaults = {
    qa: "1",
    utm_source: "codex",
    utm_medium: "qa",
    utm_campaign: QA_EXPERIMENT_ID,
    utm_content: "fullfilm_price",
    scenario: "full-film",
    experiment_id: QA_EXPERIMENT_ID,
  };
  for (const [key, value] of Object.entries({ ...defaults, ...params })) {
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function installDiagnostics(page, label) {
  const data = {
    label,
    active: true,
    consoleErrors: [],
    pageErrors: [],
    requestFailures: [],
    httpFailures: [],
    metrikaRequests: [],
  };

  page.on("console", (message) => {
    if (data.active && message.type() === "error") data.consoleErrors.push(safeText(message.text(), 1000));
  });
  page.on("pageerror", (error) => {
    if (data.active) data.pageErrors.push(safeText(error.stack || error.message || error, 1500));
  });
  page.on("requestfailed", (request) => {
    if (!data.active) return;
    data.requestFailures.push({
      url: request.url(),
      method: request.method(),
      error: request.failure() ? request.failure().errorText : "unknown",
    });
  });
  page.on("response", (response) => {
    if (!data.active || response.status() < 400) return;
    data.httpFailures.push({ url: response.url(), status: response.status() });
  });
  page.on("request", (request) => {
    if (!data.active) return;
    let host = "";
    try { host = new URL(request.url()).hostname.toLowerCase(); } catch (_error) {}
    if (host === "mc.yandex.ru" || host.endsWith(".mc.yandex.ru") || host === "mc.yandex.com") {
      const item = { label, url: request.url(), method: request.method() };
      data.metrikaRequests.push(item);
      report.metrikaRequests.push(item);
    }
  });
  return data;
}

function finishDiagnostics(diagnostics, group, suffix) {
  diagnostics.active = false;
  const pass = diagnostics.consoleErrors.length === 0 &&
    diagnostics.pageErrors.length === 0 &&
    diagnostics.requestFailures.length === 0 &&
    diagnostics.httpFailures.length === 0;
  addCheck(group, `${suffix}.runtime-clean`, pass, {
    consoleErrors: diagnostics.consoleErrors,
    pageErrors: diagnostics.pageErrors,
    requestFailures: diagnostics.requestFailures,
    httpFailures: diagnostics.httpFailures,
  });
}

async function addSafetyInit(context, options = {}) {
  await context.addInitScript(({ preventNavigation, captureTracks, saveData }) => {
    if (captureTracks) {
      Object.defineProperty(window, "__solQaTracks", { value: [], configurable: false, writable: false });
      window.addEventListener("ohtaawa:track", (event) => {
        const detail = event && event.detail ? event.detail : {};
        window.__solQaTracks.push({
          event: detail.event,
          payload: detail.payload || {},
          qa: detail.qa,
        });
      });
    }

    if (preventNavigation) {
      document.addEventListener("click", (event) => {
        const anchor = event.target && event.target.closest ? event.target.closest("a[href]") : null;
        const href = anchor ? anchor.getAttribute("href") : "";
        if (anchor && !(href || "").trim().startsWith("#")) event.preventDefault();
      }, true);
      window.open = () => null;
    }

    if (saveData) {
      const connection = {
        saveData: true,
        effectiveType: "4g",
        downlink: 10,
        rtt: 50,
        addEventListener() {},
        removeEventListener() {},
      };
      for (const name of ["connection", "mozConnection", "webkitConnection"]) {
        try {
          Object.defineProperty(window.navigator, name, {
            configurable: true,
            enumerable: true,
            get: () => connection,
          });
        } catch (_error) {
          try {
            Object.defineProperty(Navigator.prototype, name, {
              configurable: true,
              enumerable: true,
              get: () => connection,
            });
          } catch (_ignored) {}
        }
      }
      Object.defineProperty(window, "__solSaveDataOverride", { value: true, configurable: false });
    }
  }, options);
}

async function waitForApp(page) {
  await page.waitForLoadState("networkidle", { timeout: 20000 });
  await page.waitForFunction(() => Boolean(window.ohtaawaAnalytics), null, { timeout: 10000 });
  await page.waitForTimeout(200);
}

async function initialProofResourceSnapshot(page) {
  return page.evaluate(({ retainedProofFilenames, secondaryProofFilenames }) => {
    const filenameFrom = (value) => {
      try {
        const pathname = new URL(value, location.href).pathname;
        return decodeURIComponent(pathname.split("/").pop() || "").toLowerCase();
      } catch (_error) {
        return "";
      }
    };
    const retained = new Set(retainedProofFilenames.map((item) => item.toLowerCase()));
    const secondary = new Set(secondaryProofFilenames.map((item) => item.toLowerCase()));
    const proof = document.querySelector("#proof");
    const resourceEntries = performance.getEntriesByType("resource").map((entry) => ({
      name: entry.name,
      filename: filenameFrom(entry.name),
      initiatorType: entry.initiatorType,
      startTime: Number(entry.startTime.toFixed(2)),
      transferSize: Number(entry.transferSize) || 0,
      decodedBodySize: Number(entry.decodedBodySize) || 0,
    })).filter((entry) => retained.has(entry.filename));
    const secondaryRequests = resourceEntries.filter((entry) => secondary.has(entry.filename));
    const proofRect = proof ? proof.getBoundingClientRect() : null;
    return {
      scrollY: window.scrollY,
      viewportHeight: window.innerHeight,
      proofDocumentTop: proofRect ? Number((proofRect.top + window.scrollY).toFixed(1)) : null,
      retainedResourceEntries: resourceEntries,
      secondaryRequests,
    };
  }, {
    retainedProofFilenames: RETAINED_PROOF_FILENAMES,
    secondaryProofFilenames: SECONDARY_PROOF_FILENAMES,
  });
}

async function auditResponsiveContactAccessibleNames(page) {
  const results = [];
  for (const target of RESPONSIVE_CONTACT_TARGETS) {
    const locator = page.locator(target.selector);
    const count = await locator.count();
    let ariaLabel = "";
    let ariaSnapshot = "";
    let snapshotError = null;
    if (count === 1) {
      ariaLabel = safeText(await locator.first().getAttribute("aria-label"), 160);
      try {
        ariaSnapshot = await locator.first().ariaSnapshot();
      } catch (error) {
        snapshotError = safeText(error.message || error, 300);
      }
    }
    const firstSnapshotLine = String(ariaSnapshot || "").split(/\r?\n/, 1)[0].trim();
    const namedLinkMatch = firstSnapshotLine.match(/^-\s*link\s+"((?:\\.|[^"])*)"(?:\s|:|$)/u);
    const accessibleName = namedLinkMatch ? safeText(namedLinkMatch[1], 160) : "";
    const nameMatchesLabel = ariaLabel.length > 0 && accessibleName === ariaLabel;
    results.push({
      id: target.id,
      selector: target.selector,
      count,
      ariaLabel,
      accessibleName,
      nameMatchesLabel,
      ariaSnapshot: safeText(ariaSnapshot, 400),
      snapshotError,
      pass: count === 1 && ariaLabel.length > 0 && accessibleName.length > 0 && nameMatchesLabel,
    });
  }
  return {
    expected: RESPONSIVE_CONTACT_TARGETS.map((item) => item.id),
    results,
    missingOrUnnamed: results.filter((item) => !item.pass),
  };
}

async function traverseSections(page) {
  const count = await page.locator("main section, main > article, footer").count();
  for (let index = 0; index < count; index += 1) {
    await page.locator("main section, main > article, footer").nth(index).evaluate((element) => {
      element.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });
    });
    await page.waitForTimeout(140);
  }
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, left: 0, behavior: "auto" }));
  await page.waitForTimeout(300);
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    await Promise.all(images.map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise((resolve) => {
        const timer = setTimeout(resolve, 3000);
        image.addEventListener("load", () => { clearTimeout(timer); resolve(); }, { once: true });
        image.addEventListener("error", () => { clearTimeout(timer); resolve(); }, { once: true });
      });
    }));
  });
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  await page.waitForTimeout(250);
  return count;
}

async function pageIntegrity(page) {
  return page.evaluate(() => {
    const isVisible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" &&
        Number.parseFloat(style.opacity || "1") >= 0.98 && rect.width > 0 && rect.height > 0;
    };
    const allReveals = Array.from(document.querySelectorAll("[data-reveal]"));
    const selectedMessageVariant = document.body.dataset.msgVariant || "default";
    const isInactiveMessageAlternative = (element) => {
      const branch = element.closest("[data-msg-lead]");
      return Boolean(branch && branch.dataset.msgLead !== selectedMessageVariant && getComputedStyle(branch).display === "none");
    };
    const ignoredInactiveReveals = allReveals.filter(isInactiveMessageAlternative);
    const reveals = allReveals.filter((element) => !isInactiveMessageAlternative(element));
    const hiddenReveals = reveals.filter((element) => !isVisible(element)).map((element) => ({
      tag: element.tagName.toLowerCase(),
      id: element.id || null,
      className: String(element.className || "").slice(0, 160),
      opacity: getComputedStyle(element).opacity,
      display: getComputedStyle(element).display,
      visibility: getComputedStyle(element).visibility,
    }));
    const brokenImages = Array.from(document.images).filter((image) => !image.complete || image.naturalWidth < 1).map((image) => ({
      src: image.currentSrc || image.src,
      alt: image.alt,
      complete: image.complete,
      naturalWidth: image.naturalWidth,
    }));
    const root = document.documentElement;
    const body = document.body;
    const clippedElements = Array.from(document.querySelectorAll("body *")).filter((element) => {
      if (element.matches(".skip-link:not(:focus)")) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (style.display === "none" || style.visibility === "hidden" || rect.width <= 0 || rect.height <= 0) return false;
      if (rect.left >= -1 && rect.right <= window.innerWidth + 1) return false;
      let ancestor = element.parentElement;
      while (ancestor && ancestor !== document.body) {
        const ancestorStyle = getComputedStyle(ancestor);
        const ancestorRect = ancestor.getBoundingClientRect();
        if (["auto", "scroll"].includes(ancestorStyle.overflowX) &&
          rect.left >= ancestorRect.left - 1 && rect.right <= ancestorRect.right + ancestor.scrollWidth + 1) return false;
        ancestor = ancestor.parentElement;
      }
      return true;
    }).slice(0, 30).map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName.toLowerCase(),
        id: element.id || null,
        className: String(element.className || "").slice(0, 140),
        left: Number(rect.left.toFixed(1)),
        right: Number(rect.right.toFixed(1)),
        width: Number(rect.width.toFixed(1)),
      };
    });
    const originalX = window.scrollX;
    window.scrollTo(999999, window.scrollY);
    const movedX = window.scrollX;
    window.scrollTo(originalX, window.scrollY);
    const hero = document.querySelector(".q-hero, main > section:first-of-type");
    const heroText = hero ? hero.innerText.replace(/\s+/g, " ").trim() : "";
    return {
      revealTotal: reveals.length,
      ignoredInactiveRevealTotal: ignoredInactiveReveals.length,
      selectedMessageVariant,
      hiddenReveals,
      imageTotal: document.images.length,
      brokenImages,
      overflow: {
        viewportWidth: window.innerWidth,
        documentClientWidth: root.clientWidth,
        documentScrollWidth: root.scrollWidth,
        bodyScrollWidth: body ? body.scrollWidth : 0,
        horizontalScrollPosition: movedX,
        clippedElements,
      },
      hero: {
        exists: Boolean(hero),
        visible: hero ? isVisible(hero) : false,
        text: heroText.slice(0, 1200),
      },
    };
  });
}

function screenshotPath(name) {
  const absolute = path.join(OUTPUT_DIR, name);
  report.screenshots.push(path.relative(ROOT, absolute).replace(/\\/g, "/"));
  return absolute;
}

async function captureHeroAndFull(page, prefix) {
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  await page.waitForTimeout(150);
  await page.screenshot({ path: screenshotPath(`${prefix}-hero.png`), fullPage: false, animations: "disabled" });
  await page.screenshot({ path: screenshotPath(`${prefix}-full.png`), fullPage: true, animations: "disabled" });
}

async function runViewportChecks() {
  for (const viewport of VIEWPORTS) {
    const group = `viewport.${viewport.id}`;
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      colorScheme: "light",
      locale: "ru-RU",
      reducedMotion: "no-preference",
    });
    await addSafetyInit(context, { preventNavigation: true, captureTracks: false, saveData: false });
    const page = await context.newPage();
    const diagnostics = installDiagnostics(page, viewport.id);
    await page.goto(qaUrl(), { waitUntil: "domcontentloaded", timeout: 20000 });
    await waitForApp(page);
    const initialProofResources = await initialProofResourceSnapshot(page);
    addCheck(group, `${viewport.id}.initial-secondary-proof-resources-zero`,
      initialProofResources.scrollY === 0 && initialProofResources.secondaryRequests.length === 0,
      initialProofResources);
    if (MOBILE_ACCESSIBLE_NAME_WIDTHS.has(viewport.width)) {
      const contactNames = await auditResponsiveContactAccessibleNames(page);
      addCheck(group, `${viewport.id}.responsive-contact-accessible-names`,
        contactNames.missingOrUnnamed.length === 0,
        contactNames);
    }
    const traversed = await traverseSections(page);
    const integrity = await pageIntegrity(page);
    await captureHeroAndFull(page, viewport.id);

    addCheck(group, `${viewport.id}.sections-traversed`, traversed >= 5, { count: traversed });
    addCheck(group, `${viewport.id}.hero-visible`, integrity.hero.exists && integrity.hero.visible && integrity.hero.text.length >= 80, integrity.hero);
    addCheck(group, `${viewport.id}.no-horizontal-overflow`,
      integrity.overflow.documentScrollWidth <= integrity.overflow.viewportWidth + 1 &&
      integrity.overflow.bodyScrollWidth <= integrity.overflow.viewportWidth + 1 &&
      integrity.overflow.horizontalScrollPosition === 0 && integrity.overflow.clippedElements.length === 0,
      integrity.overflow);
    addCheck(group, `${viewport.id}.all-reveals-visible`,
      integrity.revealTotal > 0 && integrity.hiddenReveals.length === 0,
      { total: integrity.revealTotal, hidden: integrity.hiddenReveals });
    addCheck(group, `${viewport.id}.images-load`,
      integrity.imageTotal > 0 && integrity.brokenImages.length === 0,
      { total: integrity.imageTotal, broken: integrity.brokenImages });
    finishDiagnostics(diagnostics, group, viewport.id);
    await context.close();
  }
}

async function runNoJsChecks() {
  for (const viewport of [VIEWPORTS[0], VIEWPORTS[2]]) {
    const id = `no-js-${viewport.id}`;
    const group = `progressive-enhancement.${id}`;
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      javaScriptEnabled: false,
      locale: "ru-RU",
    });
    const page = await context.newPage();
    const diagnostics = installDiagnostics(page, id);
    await page.goto(qaUrl(), { waitUntil: "networkidle", timeout: 20000 });
    const traversed = await traverseSections(page);
    const integrity = await pageIntegrity(page);
    const content = await page.evaluate(() => ({
      mainText: (document.querySelector("main") ? document.querySelector("main").innerText : "").replace(/\s+/g, " ").trim(),
      visibleSections: Array.from(document.querySelectorAll("main section")).filter((section) => {
        const style = getComputedStyle(section);
        const rect = section.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      }).length,
      sectionTotal: document.querySelectorAll("main section").length,
    }));
    await captureHeroAndFull(page, id);

    addCheck(group, `${id}.full-content-visible`,
      traversed >= 5 && content.sectionTotal >= 5 && content.visibleSections === content.sectionTotal &&
      content.mainText.length >= 1000 && /180\s*000/.test(content.mainText) && /оклейк|пл[её]нк/iu.test(content.mainText),
      { traversed, sectionTotal: content.sectionTotal, visibleSections: content.visibleSections, textLength: content.mainText.length });
    addCheck(group, `${id}.all-reveals-visible`,
      integrity.revealTotal > 0 && integrity.hiddenReveals.length === 0,
      { total: integrity.revealTotal, hidden: integrity.hiddenReveals });
    addCheck(group, `${id}.no-horizontal-overflow`,
      integrity.overflow.documentScrollWidth <= integrity.overflow.viewportWidth + 1 &&
      integrity.overflow.bodyScrollWidth <= integrity.overflow.viewportWidth + 1 &&
      integrity.overflow.horizontalScrollPosition === 0 && integrity.overflow.clippedElements.length === 0,
      integrity.overflow);
    addCheck(group, `${id}.images-load`,
      integrity.imageTotal > 0 && integrity.brokenImages.length === 0,
      { total: integrity.imageTotal, broken: integrity.brokenImages });
    finishDiagnostics(diagnostics, group, id);
    await context.close();
  }
}

async function motionState(page) {
  return page.evaluate(() => {
    const running = document.getAnimations({ subtree: true }).filter((animation) => {
      const timing = animation.effect && animation.effect.getComputedTiming ? animation.effect.getComputedTiming() : null;
      const duration = timing && typeof timing.duration === "number" ? timing.duration : 0;
      return animation.playState === "running" && duration > 100;
    }).map((animation) => ({
      playState: animation.playState,
      duration: animation.effect.getComputedTiming().duration,
      target: animation.effect && animation.effect.target ? {
        tag: animation.effect.target.tagName.toLowerCase(),
        id: animation.effect.target.id || null,
        className: String(animation.effect.target.className || "").slice(0, 120),
      } : null,
    }));
    const selectedMessageVariant = document.body.dataset.msgVariant || "default";
    const allReveals = Array.from(document.querySelectorAll("[data-reveal]"));
    const isInactiveMessageAlternative = (element) => {
      const branch = element.closest("[data-msg-lead]");
      return Boolean(branch && branch.dataset.msgLead !== selectedMessageVariant && getComputedStyle(branch).display === "none");
    };
    const ignoredInactiveReveals = allReveals.filter(isInactiveMessageAlternative);
    const hiddenReveals = allReveals.filter((element) => !isInactiveMessageAlternative(element)).filter((element) => {
      const style = getComputedStyle(element);
      return style.display === "none" || style.visibility === "hidden" || Number.parseFloat(style.opacity || "1") < 0.98;
    }).length;
    return {
      reducedMotionMatches: matchMedia("(prefers-reduced-motion: reduce)").matches,
      runningAnimations: running,
      hiddenReveals,
      ignoredInactiveRevealTotal: ignoredInactiveReveals.length,
      selectedMessageVariant,
      saveDataClass: document.body.classList.contains("save-data"),
      analyticsSaveData: window.ohtaawaAnalytics ? window.ohtaawaAnalytics.saveData : null,
      navigatorSaveData: navigator.connection ? navigator.connection.saveData : null,
      injectedSaveDataOverride: Boolean(window.__solSaveDataOverride),
    };
  });
}

async function runReducedMotionCheck() {
  const id = "reduced-motion-mobile-390x844";
  const group = "motion.reduced-motion";
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
    locale: "ru-RU",
  });
  await addSafetyInit(context, { preventNavigation: true, captureTracks: false, saveData: false });
  const page = await context.newPage();
  const diagnostics = installDiagnostics(page, id);
  await page.goto(qaUrl(), { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForApp(page);
  await traverseSections(page);
  const state = await motionState(page);
  await captureHeroAndFull(page, id);
  addCheck(group, `${id}.replacement-is-static`,
    state.reducedMotionMatches && state.runningAnimations.length === 0 && state.hiddenReveals === 0,
    state);
  finishDiagnostics(diagnostics, group, id);
  await context.close();
}

async function runSaveDataCheck() {
  const id = "save-data-mobile-390x844";
  const group = "motion.save-data";
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: "ru-RU",
    extraHTTPHeaders: { "Save-Data": "on" },
  });
  await addSafetyInit(context, { preventNavigation: true, captureTracks: false, saveData: true });
  const page = await context.newPage();
  const diagnostics = installDiagnostics(page, id);
  await page.goto(qaUrl(), { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForApp(page);
  await traverseSections(page);
  const state = await motionState(page);
  await captureHeroAndFull(page, id);
  addCheck(group, `${id}.navigator-override-is-real`,
    state.injectedSaveDataOverride && state.navigatorSaveData === true && state.analyticsSaveData === true,
    state);
  addCheck(group, `${id}.static-visible-replacement`,
    state.saveDataClass && state.runningAnimations.length === 0 && state.hiddenReveals === 0,
    state);
  finishDiagnostics(diagnostics, group, id);
  await context.close();
}

async function auditTargetSizes(page, selector, scopeLabel) {
  return page.evaluate(({ selector: selectorValue, scopeLabel: label }) => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && Number.parseFloat(style.opacity || "1") > 0.01 && rect.width > 0 && rect.height > 0;
    };
    const descriptor = (element, index) => {
      if (element.id) return `#${element.id}`;
      const dataName = ["channel", "openContact", "closeDialog", "proofPrev", "proofNext", "slide"].find((name) => element.dataset && element.dataset[name] != null);
      if (dataName) return `${element.tagName.toLowerCase()}[data-${dataName.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}="${element.dataset[dataName]}"]`;
      return `${element.tagName.toLowerCase()}.${String(element.className || "").trim().replace(/\s+/g, ".").slice(0, 100)}:${index}`;
    };
    const controls = Array.from(document.querySelectorAll(selectorValue)).filter(visible);
    const measured = controls.map((element, index) => {
      const rect = element.getBoundingClientRect();
      return {
        control: descriptor(element, index),
        width: Number(rect.width.toFixed(1)),
        height: Number(rect.height.toFixed(1)),
        accessibleName: (element.getAttribute("aria-label") || element.innerText || element.getAttribute("placeholder") || "").replace(/\s+/g, " ").trim().slice(0, 160),
      };
    });
    return {
      scope: label,
      total: measured.length,
      measured,
      undersized: measured.filter((item) => item.width < 44 || item.height < 44),
      unnamed: measured.filter((item) => !item.accessibleName),
    };
  }, { selector, scopeLabel });
}

async function runAccessibilityChecks() {
  const id = "keyboard-focus-dialog-mobile-390x844";
  const group = "accessibility";
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ru-RU" });
  await addSafetyInit(context, { preventNavigation: true, captureTracks: false, saveData: false });
  const page = await context.newPage();
  const diagnostics = installDiagnostics(page, id);
  await page.goto(qaUrl(), { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForApp(page);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForApp(page);
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  });

  await page.keyboard.press("Tab");
  const skipState = await page.evaluate(() => {
    const active = document.activeElement;
    const rect = active ? active.getBoundingClientRect() : null;
    return {
      isSkipLink: Boolean(active && active.matches(".skip-link[href='#main']")),
      text: active ? active.textContent.trim() : "",
      rect: rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null,
      visibleInViewport: Boolean(rect && rect.left >= 0 && rect.top >= 0 && rect.width > 0 && rect.height > 0),
    };
  });
  addCheck(group, `${id}.skip-link-first-and-visible`, skipState.isSkipLink && skipState.visibleInViewport, skipState);

  const skipLink = page.locator(".skip-link[href='#main']").first();
  if (await skipLink.count()) await skipLink.press("Enter");
  addCheck(group, `${id}.skip-link-targets-main`, await page.evaluate(() => location.hash === "#main"), { hash: await page.evaluate(() => location.hash) });

  await traverseSections(page);

  const outsideSizes = await auditTargetSizes(page,
    "[data-open-contact], [data-channel], [data-proof-prev], [data-proof-next], [data-proof-pause], .q-proof-thumbs button, #q-car-input, summary",
    "page");
  addCheck(group, `${id}.page-primary-controls-44px`, outsideSizes.total > 0 && outsideSizes.undersized.length === 0, outsideSizes);
  addCheck(group, `${id}.page-controls-have-names`, outsideSizes.total > 0 && outsideSizes.unnamed.length === 0, { total: outsideSizes.total, unnamed: outsideSizes.unnamed });

  const tabModel = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll("a[href], button, input, select, textarea, summary, [tabindex]"));
    const positive = all.filter((element) => Number(element.getAttribute("tabindex")) > 0).map((element) => ({
      tag: element.tagName.toLowerCase(), id: element.id || null, tabIndex: element.getAttribute("tabindex"),
    }));
    const duplicateIds = Array.from(document.querySelectorAll("[id]")).map((element) => element.id).filter((value, index, values) => values.indexOf(value) !== index);
    return { positiveTabIndex: positive, duplicateIds: Array.from(new Set(duplicateIds)), lang: document.documentElement.lang };
  });
  addCheck(group, `${id}.logical-tab-model`, tabModel.positiveTabIndex.length === 0 && tabModel.duplicateIds.length === 0 && tabModel.lang === "ru", tabModel);

  const trigger = page.locator("[data-open-contact]").first();
  const triggerCount = await trigger.count();
  let dialogOpenState = { triggerCount };
  if (triggerCount) {
    await trigger.focus();
    const focusProof = await trigger.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        focusVisible: element.matches(":focus-visible"),
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow,
      };
    });
    addCheck(group, `${id}.trigger-has-visible-focus`,
      focusProof.focusVisible && (focusProof.outlineStyle !== "none" || focusProof.boxShadow !== "none"),
      focusProof);

    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);
    dialogOpenState = await page.evaluate(() => {
      const dialog = document.querySelector("dialog#contact-dialog, dialog[aria-labelledby]");
      const active = document.activeElement;
      return {
        exists: Boolean(dialog),
        open: Boolean(dialog && dialog.open),
        labelledBy: dialog ? dialog.getAttribute("aria-labelledby") : null,
        labelExists: Boolean(dialog && dialog.getAttribute("aria-labelledby") && document.getElementById(dialog.getAttribute("aria-labelledby"))),
        focusInside: Boolean(dialog && active && dialog.contains(active)),
        activeTag: active ? active.tagName.toLowerCase() : null,
        activeName: active ? (active.getAttribute("aria-label") || active.textContent || "").replace(/\s+/g, " ").trim().slice(0, 100) : "",
      };
    });
    addCheck(group, `${id}.dialog-opens-from-keyboard`, dialogOpenState.exists && dialogOpenState.open && dialogOpenState.labelExists && dialogOpenState.focusInside, dialogOpenState);

    const dialogSizes = await auditTargetSizes(page, "dialog[open] [data-channel], dialog[open] [data-close-dialog], dialog[open] a[href], dialog[open] button", "dialog");
    addCheck(group, `${id}.dialog-controls-44px`, dialogSizes.total > 0 && dialogSizes.undersized.length === 0, dialogSizes);
    addCheck(group, `${id}.dialog-controls-have-names`, dialogSizes.total > 0 && dialogSizes.unnamed.length === 0, { total: dialogSizes.total, unnamed: dialogSizes.unnamed });

    const trapStates = [];
    const dialogTabCount = await page.locator("dialog[open] a[href], dialog[open] button, dialog[open] input, dialog[open] [tabindex='0']").count();
    for (let index = 0; index < dialogTabCount + 2; index += 1) {
      await page.keyboard.press("Tab");
      trapStates.push(await page.evaluate(() => {
        const dialog = document.querySelector("dialog[open]");
        return Boolean(dialog && dialog.contains(document.activeElement));
      }));
    }
    addCheck(group, `${id}.dialog-focus-trap`, dialogTabCount > 0 && trapStates.every(Boolean), { dialogTabCount, trapStates });

    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);
    const closeState = await page.evaluate(() => {
      const dialog = document.querySelector("dialog#contact-dialog, dialog[aria-labelledby]");
      return {
        closed: Boolean(dialog && !dialog.open),
        bodyUnlocked: !document.body.classList.contains("dialog-open"),
        focusReturnedToTrigger: Boolean(document.activeElement && document.activeElement.matches("[data-open-contact]")),
      };
    });
    addCheck(group, `${id}.dialog-escape-restores-focus`, closeState.closed && closeState.bodyUnlocked && closeState.focusReturnedToTrigger, closeState);
  } else {
    addCheck(group, `${id}.dialog-opens-from-keyboard`, false, dialogOpenState);
  }

  finishDiagnostics(diagnostics, group, id);
  await context.close();
}

async function runMessageMatchChecks() {
  const group = "message-match";
  const cases = [
    {
      content: "newcar_fullfilm",
      semanticPass: (snapshot) => /нов(?:ый|ого)\s+автомобил/iu.test(snapshot.lead) && /защит/iu.test(snapshot.lead),
      expectedVariant: /new.?car|newcar/iu,
      expectedLeadVariant: "newcar",
    },
    {
      content: "price_install_fullfilm",
      semanticPass: (snapshot) => [
        /180\s*000/iu,
        /пл[её]нк/iu,
        /подготов/iu,
        /монтаж|установ/iu,
        /финальн[а-яё]*\s+контрол/iu,
      ].every((pattern) => pattern.test(snapshot.lead)),
      expectedVariant: /price|install/iu,
      expectedLeadVariant: "price",
    },
  ];
  const snapshots = [];

  for (const item of cases) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "ru-RU" });
    await addSafetyInit(context, { preventNavigation: true, captureTracks: true, saveData: false });
    const page = await context.newPage();
    const diagnostics = installDiagnostics(page, `message-match-${item.content}`);
    await page.goto(qaUrl({ utm_content: item.content }), { waitUntil: "domcontentloaded", timeout: 20000 });
    await waitForApp(page);
    const snapshot = await page.evaluate(() => {
      const hero = document.querySelector(".q-hero, main > section:first-of-type");
      const analytics = window.ohtaawaAnalytics || {};
      const landing = (window.__solQaTracks || []).find((event) => event.event === "landing_view");
      const attribution = analytics.attribution || {};
      const visibleLead = Array.from(document.querySelectorAll("[data-msg-lead], .q-hero-lead")).find((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && Number.parseFloat(style.opacity || "1") > 0.01 && rect.width > 0 && rect.height > 0;
      });
      return {
        heroText: hero ? hero.innerText.replace(/\s+/g, " ").trim() : "",
        eyebrow: (document.querySelector("[data-hero-eyebrow-copy], .q-hero-eyebrow") || {}).textContent || "",
        lead: visibleLead ? visibleLead.textContent : "",
        leadVariant: visibleLead ? visibleLead.getAttribute("data-msg-lead") : null,
        price: (document.querySelector(".q-hero-price") || {}).textContent || "",
        isQa: analytics.isQa,
        attribution,
        landingPayload: landing ? landing.payload : null,
        messageVariant: attribution.message_variant || (landing && landing.payload ? landing.payload.message_variant : null),
      };
    });
    snapshot.heroText = safeText(snapshot.heroText, 2000);
    snapshot.eyebrow = safeText(snapshot.eyebrow);
    snapshot.lead = safeText(snapshot.lead, 1000);
    snapshot.price = safeText(snapshot.price);
    snapshots.push({ content: item.content, snapshot });

    addCheck(group, `message-match.${item.content}.attribution`,
      snapshot.isQa === true && snapshot.attribution.utm_content === item.content &&
      snapshot.attribution.scenario === "full-film" && snapshot.attribution.experiment_id === QA_EXPERIMENT_ID,
      snapshot);
    addCheck(group, `message-match.${item.content}.hero-copy`,
      /180\s*000/iu.test(snapshot.heroText) && /оклейк|пл[её]нк/iu.test(snapshot.heroText) &&
      snapshot.leadVariant === item.expectedLeadVariant && item.semanticPass(snapshot),
      { heroText: snapshot.heroText, eyebrow: snapshot.eyebrow, lead: snapshot.lead, leadVariant: snapshot.leadVariant, price: snapshot.price });
    addCheck(group, `message-match.${item.content}.variant-in-analytics`,
      Boolean(snapshot.messageVariant) && item.expectedVariant.test(String(snapshot.messageVariant)) &&
      Boolean(snapshot.landingPayload && snapshot.landingPayload.message_variant),
      { messageVariant: snapshot.messageVariant, landingPayload: snapshot.landingPayload });
    finishDiagnostics(diagnostics, group, `message-match.${item.content}`);
    await context.close();
  }

  addCheck(group, "message-match.variants-are-distinct",
    snapshots.length === 2 && snapshots[0].snapshot.messageVariant !== snapshots[1].snapshot.messageVariant &&
    snapshots[0].snapshot.heroText !== snapshots[1].snapshot.heroText,
    { variants: snapshots.map((item) => ({ content: item.content, variant: item.snapshot.messageVariant, heroText: item.snapshot.heroText })) });
}

async function runEventMappingChecks() {
  const id = "canonical-event-map";
  const group = "analytics";
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "ru-RU" });
  await addSafetyInit(context, { preventNavigation: true, captureTracks: true, saveData: false });
  const page = await context.newPage();
  const diagnostics = installDiagnostics(page, id);
  await page.goto(qaUrl({ utm_content: "price_install_fullfilm" }), { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForApp(page);

  const contract = await page.evaluate((canonical) => {
    const configNode = document.getElementById("landing-config");
    let config = {};
    try { config = configNode ? JSON.parse(configNode.textContent || "{}") : {}; } catch (_error) {}
    const viewMappings = Array.from(document.querySelectorAll("[data-view-event]")).map((element) => element.dataset.viewEvent);
    const trackedMappings = Array.from(document.querySelectorAll("[data-track-event]")).map((element) => ({
      event: element.dataset.trackEvent,
      location: element.dataset.contactLocation || element.dataset.trackLocation || null,
      explicitContactLocation: element.dataset.contactLocation || null,
    }));
    const channels = Array.from(document.querySelectorAll("[data-channel]")).map((element) => ({
      channel: element.dataset.channel,
      location: element.dataset.contactLocation || null,
      href: element.getAttribute("href") || "",
      copyMessage: element.dataset.copyMessage || null,
    }));
    const leadElements = Array.from(document.querySelectorAll("[data-track-event^='lead_'], [data-channel]"));
    const missingContactLocations = leadElements.filter((element) => !element.dataset.contactLocation).map((element) => ({
      tag: element.tagName.toLowerCase(), event: element.dataset.trackEvent || null, channel: element.dataset.channel || null,
    }));
    return {
      counter: config.metrikaCounter,
      bodyCounters: document.body.getAttribute("data-ohtaawa-metrica-counter-ids"),
      analyticsIsQa: Boolean(window.ohtaawaAnalytics && window.ohtaawaAnalytics.isQa),
      currentUrlQa: new URL(location.href).searchParams.get("qa"),
      viewMappings,
      trackedMappings,
      channels,
      missingContactLocations,
      expected: canonical,
    };
  }, CANONICAL);
  const privacyContract = await page.evaluate(() => {
    const carInput = document.getElementById("q-car-input");
    const isWhatsappHref = (value) => {
      try {
        const hostname = new URL(value, location.href).hostname.toLowerCase();
        return hostname === "wa.me" || hostname.endsWith(".wa.me") ||
          hostname === "whatsapp.com" || hostname.endsWith(".whatsapp.com");
      } catch (_error) {
        return false;
      }
    };
    const whatsappLinks = Array.from(document.querySelectorAll("a[href], a[data-channel]"))
      .filter((element) => element.dataset.channel === "whatsapp" || isWhatsappHref(element.getAttribute("href") || ""))
      .map((element, index) => {
        let destination = "";
        try {
          const url = new URL(element.getAttribute("href") || "", location.href);
          destination = `${url.hostname}${url.pathname}`;
        } catch (_error) {}
        return {
          index,
          location: element.dataset.contactLocation || null,
          destination,
          classes: Array.from(element.classList),
          hasTracklinkOptOut: element.classList.contains("ym-disable-tracklink"),
          hasClickmapOptOut: element.classList.contains("ym-disable-clickmap"),
        };
      });
    return {
      carInput: {
        exists: Boolean(carInput),
        classes: carInput ? Array.from(carInput.classList) : [],
        hasKeysOptOut: Boolean(carInput && carInput.classList.contains("ym-disable-keys")),
      },
      whatsappLinks,
      nonCompliantWhatsappLinks: whatsappLinks.filter((item) => !item.hasTracklinkOptOut || !item.hasClickmapOptOut),
    };
  });
  addCheck("privacy", `${id}.car-input-ym-disable-keys`,
    privacyContract.carInput.exists && privacyContract.carInput.hasKeysOptOut,
    privacyContract.carInput);
  addCheck("privacy", `${id}.all-whatsapp-links-webvisor-opt-out`,
    privacyContract.whatsappLinks.length > 0 && privacyContract.nonCompliantWhatsappLinks.length === 0,
    privacyContract);
  addCheck(group, `${id}.counter-and-qa-mode`,
    Number(contract.counter) === 110584673 && contract.bodyCounters === "110584673" && contract.analyticsIsQa && contract.currentUrlQa === "1",
    contract);
  addCheck(group, `${id}.dom-view-map`,
    CANONICAL.view.every((event) => contract.viewMappings.includes(event)),
    { expected: CANONICAL.view, actual: contract.viewMappings });
  addCheck(group, `${id}.dom-channel-map`,
    Object.keys(CANONICAL.channel).every((channel) => contract.channels.some((item) => item.channel === channel && item.location)) &&
    contract.missingContactLocations.length === 0,
    { channels: contract.channels, missingContactLocations: contract.missingContactLocations });
  addCheck(group, `${id}.dom-route-map`,
    CANONICAL.route.every((event) => contract.trackedMappings.some((item) => item.event === event && item.location)),
    { expected: CANONICAL.route, actual: contract.trackedMappings });

  for (const event of CANONICAL.view) {
    const locator = page.locator(`[data-view-event="${event}"]`).first();
    if (await locator.count()) {
      await locator.scrollIntoViewIfNeeded();
      await locator.evaluate((element) => element.scrollIntoView({ behavior: "auto", block: "center" }));
      await page.waitForTimeout(350);
    }
  }
  await page.evaluate(() => {
    const total = document.documentElement.scrollHeight - innerHeight;
    window.scrollTo({ top: total * 0.55, behavior: "auto" });
  });
  await page.waitForTimeout(250);
  await page.evaluate(() => {
    const total = document.documentElement.scrollHeight - innerHeight;
    window.scrollTo({ top: total * 0.95, behavior: "auto" });
  });
  await page.waitForTimeout(250);

  const channelResults = [];
  const carInput = page.locator("#q-car-input");
  const carInputExists = Boolean(await carInput.count());
  if (carInputExists) await carInput.fill("BMW X5");
  addCheck(group, `${id}.car-question-present`, carInputExists, { selector: "#q-car-input" });
  for (const [channel, goal] of Object.entries(CANONICAL.channel)) {
    const locator = page.locator(`[data-channel="${channel}"]`).first();
    if (!(await locator.count())) {
      channelResults.push({ channel, goal, exists: false });
      continue;
    }
    const before = await page.evaluate(() => window.__solQaTracks.length);
    await locator.evaluate((element) => element.click());
    await page.waitForTimeout(80);
    const result = await page.evaluate(({ before: start, channel: channelName, goal: goalName }) => {
      const events = window.__solQaTracks.slice(start);
      const element = document.querySelector(`[data-channel="${channelName}"]`);
      return {
        events,
        goalCount: events.filter((item) => item.event === goalName).length,
        genericCount: events.filter((item) => item.event === "contact_channel_click").length,
        goalPayload: (events.find((item) => item.event === goalName) || {}).payload || null,
        href: element ? element.href : null,
      };
    }, { before, channel, goal });
    channelResults.push({ channel, goal, exists: true, ...result });
  }
  addCheck(group, `${id}.channel-events-one-canonical-goal`,
    channelResults.every((item) => item.exists && item.goalCount === 1 && item.genericCount === 1 &&
      item.goalPayload && item.goalPayload.location && item.goalPayload.message_variant),
    channelResults);
  const whatsapp = channelResults.find((item) => item.channel === "whatsapp");
  addCheck(group, `${id}.whatsapp-prepared-message`,
    carInputExists && Boolean(whatsapp && whatsapp.href && /[?&]text=/.test(whatsapp.href) && /BMW(?:%20|\+)X5/i.test(whatsapp.href)),
    whatsapp || {});

  const routeResults = [];
  for (const event of CANONICAL.route) {
    const locator = page.locator(`[data-track-event="${event}"]`).first();
    if (!(await locator.count())) {
      routeResults.push({ event, exists: false });
      continue;
    }
    const before = await page.evaluate(() => window.__solQaTracks.length);
    await locator.evaluate((element) => element.click());
    await page.waitForTimeout(60);
    const emitted = await page.evaluate(({ before: start, event: name }) => {
      const matches = window.__solQaTracks.slice(start).filter((item) => item.event === name);
      return { count: matches.length, events: matches };
    }, { before, event });
    routeResults.push({ event, exists: true, ...emitted });
  }
  addCheck(group, `${id}.route-events-one-canonical-event`,
    routeResults.every((item) => item.exists && item.count === 1 && item.events[0].payload.location && item.events[0].payload.message_variant),
    routeResults);

  const emitted = await page.evaluate(() => window.__solQaTracks.slice());
  const emittedNames = emitted.map((item) => item.event);
  const required = ["landing_view", ...CANONICAL.view, ...CANONICAL.scroll, ...Object.values(CANONICAL.channel), ...CANONICAL.route];
  const missing = required.filter((event) => !emittedNames.includes(event));
  const invalidQa = emitted.filter((item) => item.qa !== true);
  const invalidAttribution = emitted.filter((item) => !item.payload || item.payload.scenario !== "full-film" ||
    item.payload.experiment_id !== QA_EXPERIMENT_ID || !item.payload.message_variant);
  addCheck(group, `${id}.all-required-events-emitted`, missing.length === 0, { required, missing, emittedNames });
  addCheck(group, `${id}.all-events-qa-and-attributed`, invalidQa.length === 0 && invalidAttribution.length === 0,
    { total: emitted.length, invalidQa, invalidAttribution });

  finishDiagnostics(diagnostics, group, id);
  await context.close();
}

async function gallerySnapshot(page) {
  return page.evaluate(() => {
    const selected = document.querySelector(".q-proof-thumbs [aria-selected='true']");
    const main = document.querySelector("[data-proof-main]");
    const counter = document.querySelector("[data-proof-counter]");
    const title = document.querySelector("[data-proof-title]");
    return {
      selectedSlide: selected ? selected.getAttribute("data-slide") : null,
      src: main ? (main.currentSrc || main.src) : null,
      counter: counter ? counter.textContent.trim() : null,
      title: title ? title.textContent.trim() : null,
    };
  });
}

function sameGalleryState(left, right) {
  return left.selectedSlide === right.selectedSlide && left.src === right.src && left.counter === right.counter && left.title === right.title;
}

async function deliberateRetainedProofTraversal(page) {
  const tabSelector = ".q-proof-thumbs [data-slide]";
  const inventory = await page.locator(tabSelector).evaluateAll((tabs) => {
    const filenameFrom = (value) => {
      try {
        const pathname = new URL(value, location.href).pathname;
        return decodeURIComponent(pathname.split("/").pop() || "").toLowerCase();
      } catch (_error) {
        return "";
      }
    };
    return tabs.map((tab, index) => {
      const image = tab.querySelector("img");
      const declaredSource = tab.getAttribute("data-src") ||
        (image && image.getAttribute("data-src")) ||
        (image && image.getAttribute("src")) || "";
      return {
        index,
        slide: tab.getAttribute("data-slide"),
        declaredSource,
        filename: filenameFrom(declaredSource),
        imageSrc: image ? image.getAttribute("src") : null,
        imageDataSrc: image ? image.getAttribute("data-src") : null,
      };
    });
  });

  const steps = [];
  for (const expectedFilename of RETAINED_PROOF_FILENAMES) {
    const inventoryItem = inventory.find((item) => item.filename === expectedFilename);
    if (!inventoryItem) {
      steps.push({ expectedFilename, found: false, pass: false });
      continue;
    }

    const tab = page.locator(tabSelector).nth(inventoryItem.index);
    let clickError = null;
    let waitError = null;
    try {
      await tab.click({ timeout: 5000 });
    } catch (error) {
      clickError = safeText(error.message || error, 500);
    }
    if (!clickError) {
      try {
        await page.waitForFunction((filename) => {
          const main = document.querySelector("[data-proof-main]");
          if (!main) return false;
          let currentFilename = "";
          try {
            const pathname = new URL(main.currentSrc || main.src, location.href).pathname;
            currentFilename = decodeURIComponent(pathname.split("/").pop() || "").toLowerCase();
          } catch (_error) {}
          return currentFilename === filename && main.complete && main.naturalWidth > 0;
        }, expectedFilename, { timeout: 5000 });
      } catch (error) {
        waitError = safeText(error.message || error, 500);
      }
    }

    const state = await page.evaluate(async (filename) => {
      const filenameFrom = (value) => {
        try {
          const pathname = new URL(value, location.href).pathname;
          return decodeURIComponent(pathname.split("/").pop() || "").toLowerCase();
        } catch (_error) {
          return "";
        }
      };
      const main = document.querySelector("[data-proof-main]");
      let decodeAttempted = false;
      let decoded = false;
      let decodeError = null;
      if (main) {
        if (typeof main.decode === "function") {
          decodeAttempted = true;
          try {
            await main.decode();
            decoded = main.complete && main.naturalWidth > 0;
          } catch (error) {
            decodeError = String(error && error.message ? error.message : error).slice(0, 300);
          }
        } else {
          decoded = main.complete && main.naturalWidth > 0;
        }
      }
      const resourceEntries = performance.getEntriesByType("resource")
        .filter((entry) => filenameFrom(entry.name) === filename)
        .map((entry) => ({
          initiatorType: entry.initiatorType,
          startTime: Number(entry.startTime.toFixed(2)),
          transferSize: Number(entry.transferSize) || 0,
          decodedBodySize: Number(entry.decodedBodySize) || 0,
        }));
      return {
        mainExists: Boolean(main),
        currentSrc: main ? (main.currentSrc || main.src) : null,
        currentFilename: main ? filenameFrom(main.currentSrc || main.src) : "",
        complete: Boolean(main && main.complete),
        naturalWidth: main ? main.naturalWidth : 0,
        naturalHeight: main ? main.naturalHeight : 0,
        decodeAttempted,
        decoded,
        decodeError,
        resourceEntries,
      };
    }, expectedFilename);
    const pass = !clickError && !waitError && state.currentFilename === expectedFilename &&
      state.complete && state.naturalWidth > 0 && state.naturalHeight > 0 && state.decoded &&
      state.resourceEntries.length > 0;
    steps.push({ expectedFilename, found: true, inventory: inventoryItem, clickError, waitError, state, pass });
  }

  const declaredFilenames = inventory.map((item) => item.filename).filter(Boolean);
  const expectedSorted = Array.from(RETAINED_PROOF_FILENAMES).sort();
  const declaredSorted = declaredFilenames.slice().sort();
  const exactRetainedSet = inventory.length === RETAINED_PROOF_FILENAMES.length &&
    declaredSorted.length === expectedSorted.length &&
    expectedSorted.every((filename, index) => declaredSorted[index] === filename);
  return {
    expected: RETAINED_PROOF_FILENAMES,
    inventory,
    declaredFilenames,
    exactRetainedSet,
    steps,
    allLoadedAndDecoded: exactRetainedSet && steps.length === RETAINED_PROOF_FILENAMES.length && steps.every((step) => step.pass),
  };
}

async function runManualGalleryCheck() {
  const id = "manual-gallery";
  const group = "gallery";
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "ru-RU" });
  await addSafetyInit(context, { preventNavigation: true, captureTracks: true, saveData: false });
  const page = await context.newPage();
  const diagnostics = installDiagnostics(page, id);
  await page.goto(qaUrl(), { waitUntil: "domcontentloaded", timeout: 20000 });
  await waitForApp(page);
  const gallery = page.locator(".q-proof-gallery").first();
  if (await gallery.count()) await gallery.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);

  const baseline = await gallerySnapshot(page);
  await page.waitForTimeout(9000);
  const idleAfterNineSeconds = await gallerySnapshot(page);
  const next = page.locator("[data-proof-next]").first();
  const nextExists = Boolean(await next.count());
  if (nextExists) await next.click();
  await page.waitForTimeout(350);
  const afterManualNext = await gallerySnapshot(page);
  await page.waitForTimeout(9000);
  const afterManualIdle = await gallerySnapshot(page);
  const pauseControls = await page.locator("[data-proof-pause]").count();
  const retainedProofTraversal = await deliberateRetainedProofTraversal(page);
  const afterDeliberateTraversal = await gallerySnapshot(page);
  await page.waitForTimeout(9000);
  const afterDeliberateTraversalIdle = await gallerySnapshot(page);

  addCheck(group, `${id}.no-initial-autonomous-change`, sameGalleryState(baseline, idleAfterNineSeconds), { baseline, idleAfterNineSeconds });
  addCheck(group, `${id}.manual-next-works`, nextExists && !sameGalleryState(idleAfterNineSeconds, afterManualNext), { nextExists, before: idleAfterNineSeconds, after: afterManualNext });
  addCheck(group, `${id}.no-autonomous-change-after-interaction`, sameGalleryState(afterManualNext, afterManualIdle), { afterManualNext, afterManualIdle });
  addCheck(group, `${id}.no-misleading-pause-control`, pauseControls === 0, { pauseControls });
  addCheck(group, `${id}.retained-proof-set-exact`, retainedProofTraversal.exactRetainedSet, retainedProofTraversal);
  addCheck(group, `${id}.retained-proof-images-loaded-and-decoded`, retainedProofTraversal.allLoadedAndDecoded, retainedProofTraversal);
  addCheck(group, `${id}.no-autonomous-change-after-deliberate-traversal`,
    sameGalleryState(afterDeliberateTraversal, afterDeliberateTraversalIdle),
    { afterDeliberateTraversal, afterDeliberateTraversalIdle });

  finishDiagnostics(diagnostics, group, id);
  await context.close();
}

async function main() {
  prepareOutput();
  report.source = {
    index: sourceFingerprint("index.html"),
    css: sourceFingerprint(path.join("assets", "qwen-full-film.css")),
    js: sourceFingerprint(path.join("assets", "qwen-full-film.js")),
    runner: sourceFingerprint(path.join("scripts", "sol_qa_v2_1.cjs")),
  };
  runStaticV23Contracts();

  serverHandle = await createStaticServer();
  report.server = { mode: serverHandle.mode, baseUrl: serverHandle.baseUrl };
  browser = await launchBrowser();

  await runViewportChecks();
  await runNoJsChecks();
  await runReducedMotionCheck();
  await runSaveDataCheck();
  await runAccessibilityChecks();
  await runMessageMatchChecks();
  await runEventMappingChecks();
  await runManualGalleryCheck();

  addCheck("analytics", "qa-isolation.zero-metrika-requests", report.metrikaRequests.length === 0, { requests: report.metrikaRequests });
}

(async () => {
  try {
    await main();
  } catch (error) {
    addCheck("runner", "runner.fatal", false, { message: error.message, stack: error.stack });
  } finally {
    if (browser) {
      try { await browser.close(); } catch (_error) {}
    }
    if (serverHandle) {
      try { await serverHandle.close(); } catch (_error) {}
    }
    writeReport();
    const summary = report.summary;
    process.stdout.write(`SOL QA ${QA_VERSION}: ${summary.pass ? "PASS" : "FAIL"} (${summary.passed}/${summary.total}); report=${REPORT_PATH}\n`);
    if (!summary.pass) process.exitCode = 1;
  }
})();
