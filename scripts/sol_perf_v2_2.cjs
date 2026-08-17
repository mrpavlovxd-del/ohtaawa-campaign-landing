"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "artifacts", "sol-performance-v2-4");
const JSON_PATH = path.join(OUTPUT_DIR, "performance-report.json");
const MD_PATH = path.join(OUTPUT_DIR, "performance-report.md");

const KIB = 1024;
const MIB = 1024 * KIB;
const NETWORK = Object.freeze({
  latencyMs: 150,
  downloadBitsPerSecond: 1_600_000,
  uploadBitsPerSecond: 750_000,
  downloadBytesPerSecond: 1_600_000 / 8,
  uploadBytesPerSecond: 750_000 / 8,
  connectionType: "cellular4g",
});
const CPU_THROTTLING_RATE = 4;
const BUDGETS = Object.freeze({
  lcpMs: 2500,
  fcpMs: 1800,
  clsTarget: 0.05,
  clsMax: 0.10,
  tbtProxyMs: 200,
  mobileInitialBytes: 350 * KIB,
  desktopInitialBytes: 450 * KIB,
  fullAfterProofBytes: MIB,
});
const PROFILES = Object.freeze([
  { id: "mobile-390x844", kind: "mobile", width: 390, height: 844, runs: 5 },
  { id: "desktop-1440x1000", kind: "desktop", width: 1440, height: 1000, runs: 1 },
]);

const OBSERVER_SCRIPT = String.raw`
(() => {
  const state = {
    installedBeforeNavigation: true,
    installedAtMs: performance.now(),
    supported: {},
    errors: [],
    paints: [],
    largestContentfulPaint: [],
    layoutShifts: [],
    longTasks: [],
  };
  const observers = [];
  Object.defineProperty(window, "__solPerfV24", {
    value: state,
    configurable: false,
    enumerable: false,
    writable: false,
  });
  Object.defineProperty(window, "__solPerfV24Observers", {
    value: observers,
    configurable: false,
    enumerable: false,
    writable: false,
  });

  const supportedTypes = (typeof PerformanceObserver !== "undefined" &&
    Array.isArray(PerformanceObserver.supportedEntryTypes))
    ? PerformanceObserver.supportedEntryTypes
    : [];

  function observe(type, target, mapEntry) {
    const supported = supportedTypes.includes(type);
    state.supported[type] = supported;
    if (!supported) return;
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) target.push(mapEntry(entry));
      });
      observer.observe({ type, buffered: true });
      observers.push(observer);
    } catch (error) {
      state.errors.push({ type, message: String(error && error.message || error) });
    }
  }

  observe("paint", state.paints, (entry) => ({
    name: entry.name,
    startTime: entry.startTime,
    duration: entry.duration,
  }));
  observe("largest-contentful-paint", state.largestContentfulPaint, (entry) => ({
    startTime: entry.startTime,
    renderTime: entry.renderTime,
    loadTime: entry.loadTime,
    size: entry.size,
    url: entry.url || "",
    element: entry.element ? {
      tagName: entry.element.tagName || "",
      id: entry.element.id || "",
      className: String(entry.element.className || "").slice(0, 160),
    } : null,
  }));
  observe("layout-shift", state.layoutShifts, (entry) => ({
    startTime: entry.startTime,
    value: entry.value,
    hadRecentInput: entry.hadRecentInput,
  }));
  observe("longtask", state.longTasks, (entry) => ({
    name: entry.name,
    startTime: entry.startTime,
    duration: entry.duration,
  }));
})();
`;

const report = {
  schema: "ohtaawa-sol-performance-v2.4/1",
  startedAt: new Date().toISOString(),
  finishedAt: null,
  root: ".",
  outputDirectory: path.relative(ROOT, OUTPUT_DIR).replace(/\\/g, "/"),
  result: null,
  methodology: {
    runner: "Playwright with Chromium CDP",
    coldRunPolicy: "new incognito context per run; browser HTTP cache cleared and disabled via CDP; origin storage cleared; service workers bypassed",
    network: NETWORK,
    cpuThrottlingRate: CPU_THROTTLING_RATE,
    observerInjection: "Page.addScriptToEvaluateOnNewDocument before page.goto",
    observedEntryTypes: ["paint", "largest-contentful-paint", "layout-shift", "longtask"],
    primaryTimingPoint: "after load, CDP network quiescence, and a 1000 ms stabilization window; before scripted scroll or proof interaction",
    initialTransferDefinition: "sum of PerformanceNavigationTiming and PerformanceResourceTiming transferSize at the primary timing point",
    fullTransferDefinition: "sum of navigation and resource transferSize after proof traversal, every proof image decode, stepped full-page traversal, and every document image decode",
    initialResourceFilenameDefinition: "ordered unique filenames from navigation and resource timing entries present before scripted scroll or proof interaction",
    proofResourceGate: "the current primary proof WebP may load initially; every secondary retained proof WebP must be absent before scroll and every retained proof WebP must be present after deliberate proof traversal",
    tbtProxyDefinition: "sum(max(0, long-task duration - 50 ms)) for PerformanceObserver longtask entries beginning at or after FCP and observed before the primary timing point",
    tbtProxyWarning: "This is a clearly labeled long-task blocking proxy, not Lighthouse Total Blocking Time: no Lighthouse TTI window or Lighthouse trace model is used.",
    aggregation: "mobile primary values use the median of five cold runs; min and max are retained; hard sample assertions are also recorded for every run",
  },
  budgets: BUDGETS,
  environment: {},
  runs: [],
  aggregates: {},
  initialResourceFilenames: [],
  proofResourceGate: null,
  assertions: [],
  limitations: [],
};

let serverHandle;
let browser;

function safeOutputReset() {
  const expectedParent = path.join(ROOT, "artifacts") + path.sep;
  const resolved = path.resolve(OUTPUT_DIR);
  if (!resolved.startsWith(expectedParent) || path.basename(resolved) !== "sol-performance-v2-4") {
    throw new Error(`Unsafe output path: ${resolved}`);
  }
  fs.rmSync(resolved, { recursive: true, force: true });
  fs.mkdirSync(resolved, { recursive: true });
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

async function startStaticServer() {
  const server = http.createServer((request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD", "Cache-Control": "no-store" });
      response.end();
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    } catch (_error) {
      response.writeHead(400, { "Cache-Control": "no-store" });
      response.end("Bad request");
      return;
    }

    const relative = pathname === "/" ? "index.html" : pathname.replace(/^[/\\]+/, "");
    let filePath = path.resolve(ROOT, relative);
    const rootPrefix = ROOT + path.sep;
    if (filePath !== ROOT && !filePath.startsWith(rootPrefix)) {
      response.writeHead(403, { "Cache-Control": "no-store" });
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
      response.end(request.method === "HEAD" ? undefined : data);
    } catch (_error) {
      const data = Buffer.from("Not found", "utf8");
      response.writeHead(404, {
        "Cache-Control": "no-store",
        "Content-Length": data.length,
        "Content-Type": "text/plain; charset=utf-8",
      });
      response.end(request.method === "HEAD" ? undefined : data);
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return {
    baseUrl: `http://127.0.0.1:${address.port}/`,
    host: "127.0.0.1",
    port: address.port,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

async function launchExistingBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch (bundledError) {
    try {
      return await chromium.launch({ headless: true, channel: "chrome" });
    } catch (chromeError) {
      throw new Error(`No existing Chromium/Chrome could be launched. bundled=${bundledError.message}; chrome=${chromeError.message}`);
    }
  }
}

function auditUrl(profile, index) {
  const url = new URL(serverHandle.baseUrl);
  url.searchParams.set("qa", "1");
  url.searchParams.set("utm_source", "codex");
  url.searchParams.set("utm_medium", "performance_qa");
  url.searchParams.set("utm_campaign", "sol_perf_v2_4");
  url.searchParams.set("scenario", "full-film");
  url.searchParams.set("experiment_id", `sol_perf_v2_4_${profile.kind}_${index}`);
  return url.toString();
}

function routeLabel(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (url.hostname === "127.0.0.1" || url.hostname === "localhost") return `${url.pathname}${url.search}`;
    return `${url.origin}${url.pathname}`;
  } catch (_error) {
    return String(rawUrl).slice(0, 500);
  }
}

function installCdpNetworkLedger(cdp) {
  const records = new Map();
  let stage = "initial";
  let lastActivityAt = Date.now();

  cdp.on("Network.requestWillBeSent", (event) => {
    lastActivityAt = Date.now();
    const previous = records.get(event.requestId);
    records.set(event.requestId, {
      requestId: event.requestId,
      url: routeLabel(event.request.url),
      method: event.request.method,
      type: event.type || previous?.type || "Other",
      stage,
      startedAtCdpSeconds: event.timestamp,
      status: null,
      mimeType: null,
      protocol: null,
      fromDiskCache: false,
      fromServiceWorker: false,
      encodedDataLength: 0,
      finished: false,
      failed: false,
      failure: null,
    });
  });
  cdp.on("Network.responseReceived", (event) => {
    lastActivityAt = Date.now();
    const item = records.get(event.requestId);
    if (!item) return;
    item.type = event.type || item.type;
    item.status = event.response.status;
    item.mimeType = event.response.mimeType;
    item.protocol = event.response.protocol;
    item.fromDiskCache = Boolean(event.response.fromDiskCache);
    item.fromServiceWorker = Boolean(event.response.fromServiceWorker);
  });
  cdp.on("Network.dataReceived", () => {
    lastActivityAt = Date.now();
  });
  cdp.on("Network.loadingFinished", (event) => {
    lastActivityAt = Date.now();
    const item = records.get(event.requestId);
    if (!item) return;
    item.encodedDataLength = event.encodedDataLength;
    item.finished = true;
  });
  cdp.on("Network.loadingFailed", (event) => {
    lastActivityAt = Date.now();
    const item = records.get(event.requestId);
    if (!item) return;
    item.finished = true;
    item.failed = true;
    item.failure = event.errorText;
  });

  return {
    records,
    setStage(nextStage) { stage = nextStage; },
    inFlightCount() {
      return [...records.values()].filter((item) => !item.finished).length;
    },
    idleForMs() { return Date.now() - lastActivityAt; },
    snapshot(allowedStages) {
      const allowed = new Set(allowedStages);
      const items = [...records.values()].filter((item) => allowed.has(item.stage));
      return {
        transferBytes: items.reduce((sum, item) => sum + (Number(item.encodedDataLength) || 0), 0),
        requestCount: items.length,
        finishedCount: items.filter((item) => item.finished).length,
        failedCount: items.filter((item) => item.failed).length,
        cacheHitCount: items.filter((item) => item.fromDiskCache || item.fromServiceWorker).length,
        resources: items.map(({ requestId, startedAtCdpSeconds, ...item }) => item),
      };
    },
  };
}

async function waitForCdpIdle(page, ledger, options = {}) {
  const idleMs = options.idleMs || 750;
  const timeoutMs = options.timeoutMs || 20_000;
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (ledger.inFlightCount() === 0 && ledger.idleForMs() >= idleMs) return { timedOut: false };
    await page.waitForTimeout(50);
  }
  return { timedOut: true, inFlightCount: ledger.inFlightCount(), idleForMs: ledger.idleForMs() };
}

async function configureCdp(cdp, origin) {
  await cdp.send("Network.enable", {
    maxTotalBufferSize: 20 * MIB,
    maxResourceBufferSize: 5 * MIB,
  });
  await cdp.send("Page.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.clearBrowserCache");
  await cdp.send("Network.setBypassServiceWorker", { bypass: true });
  await cdp.send("Storage.clearDataForOrigin", { origin, storageTypes: "all" });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: NETWORK.latencyMs,
    downloadThroughput: NETWORK.downloadBytesPerSecond,
    uploadThroughput: NETWORK.uploadBytesPerSecond,
    connectionType: NETWORK.connectionType,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU_THROTTLING_RATE });
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: OBSERVER_SCRIPT });
}

async function collectSnapshot(page) {
  return page.evaluate(() => {
    const observed = window.__solPerfV24 || {
      installedBeforeNavigation: false,
      supported: {}, errors: [], paints: [], largestContentfulPaint: [], layoutShifts: [], longTasks: [],
    };
    const fcpEntry = observed.paints.find((entry) => entry.name === "first-contentful-paint") || null;
    const lcpEntry = observed.largestContentfulPaint.length
      ? observed.largestContentfulPaint[observed.largestContentfulPaint.length - 1]
      : null;
    const fcpMs = fcpEntry ? fcpEntry.startTime : null;
    const lcpMs = lcpEntry ? lcpEntry.startTime : null;
    const cls = observed.layoutShifts
      .filter((entry) => !entry.hadRecentInput)
      .reduce((sum, entry) => sum + entry.value, 0);
    const longTasksAfterFcp = fcpMs == null
      ? []
      : observed.longTasks.filter((entry) => entry.startTime >= fcpMs);
    const tbtProxyMs = fcpMs == null || !observed.supported.longtask
      ? null
      : longTasksAfterFcp.reduce((sum, entry) => sum + Math.max(0, entry.duration - 50), 0);

    const navigation = performance.getEntriesByType("navigation").map((entry) => ({
      entryType: entry.entryType,
      name: location.pathname + location.search,
      initiatorType: entry.initiatorType || "navigation",
      startTime: entry.startTime,
      duration: entry.duration,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize,
      responseStart: entry.responseStart,
      domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
      loadEventEnd: entry.loadEventEnd,
    }));
    const resources = performance.getEntriesByType("resource").map((entry) => {
      let name = entry.name;
      try {
        const url = new URL(entry.name);
        name = (url.hostname === "127.0.0.1" || url.hostname === "localhost")
          ? url.pathname + url.search
          : url.origin + url.pathname;
      } catch (_error) {}
      return {
        entryType: entry.entryType,
        name,
        initiatorType: entry.initiatorType,
        startTime: entry.startTime,
        duration: entry.duration,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize,
      };
    });
    const transferEntries = navigation.concat(resources);
    const transferBytes = transferEntries.reduce((sum, entry) => sum + (Number(entry.transferSize) || 0), 0);
    const resourceFilenames = [];
    const seenResourceFilenames = new Set();
    for (const entry of transferEntries) {
      let filename = "";
      try {
        const pathname = new URL(entry.name, location.href).pathname.replace(/\/+$/, "");
        filename = pathname ? decodeURIComponent(pathname.split("/").pop() || "") : "index.html";
      } catch (_error) {
        filename = String(entry.name || "").split(/[?#]/, 1)[0].split(/[\\/]/).pop() || "";
      }
      if (!filename) filename = entry.entryType === "navigation" ? "index.html" : "(unnamed)";
      const key = filename.toLowerCase();
      if (!seenResourceFilenames.has(key)) {
        seenResourceFilenames.add(key);
        resourceFilenames.push(filename);
      }
    }

    const nav = navigation[0] || null;
    return {
      sampledAtMs: performance.now(),
      metrics: {
        fcpMs,
        lcpMs,
        cls: observed.supported["layout-shift"] ? cls : null,
        tbtProxyMs,
        responseStartMs: nav ? nav.responseStart : null,
        domContentLoadedMs: nav ? nav.domContentLoadedEventEnd : null,
        loadEventEndMs: nav ? nav.loadEventEnd : null,
      },
      observer: {
        installedBeforeNavigation: Boolean(observed.installedBeforeNavigation),
        supported: observed.supported,
        errors: observed.errors,
        counts: {
          paint: observed.paints.length,
          largestContentfulPaint: observed.largestContentfulPaint.length,
          layoutShift: observed.layoutShifts.length,
          longTask: observed.longTasks.length,
          longTasksAfterFcp: longTasksAfterFcp.length,
        },
        lcpCandidate: lcpEntry,
        layoutShifts: observed.layoutShifts,
        longTasks: observed.longTasks,
      },
      transfer: {
        bytes: transferBytes,
        resourceFilenames,
        entries: transferEntries,
      },
    };
  });
}

async function collectProofManifest(page) {
  return page.evaluate(() => {
    const proof = document.querySelector("#proof");
    const main = proof ? proof.querySelector("[data-proof-main]") : document.querySelector("[data-proof-main]");
    const selected = proof ? proof.querySelector("[data-slide][aria-selected='true']") : null;
    const records = new Map();

    const asWebp = (rawValue) => {
      if (!rawValue) return null;
      try {
        const url = new URL(rawValue, location.href);
        if (!/\.webp$/i.test(url.pathname)) return null;
        const filename = decodeURIComponent(url.pathname.split("/").pop() || "");
        return filename ? { path: url.pathname, filename } : null;
      } catch (_error) {
        return null;
      }
    };
    const remember = (rawValue) => {
      const item = asWebp(rawValue);
      if (item && !records.has(item.path.toLowerCase())) records.set(item.path.toLowerCase(), item);
      return item;
    };

    if (proof) {
      for (const image of proof.querySelectorAll("img")) {
        remember(image.getAttribute("src"));
        remember(image.getAttribute("data-src"));
      }
      for (const node of proof.querySelectorAll("[data-src]")) remember(node.getAttribute("data-src"));
    }

    const primaryCandidates = [
      main && main.getAttribute("src"),
      main && main.getAttribute("data-src"),
      selected && selected.getAttribute("data-src"),
      proof && proof.querySelector("[data-slide]") && proof.querySelector("[data-slide]").getAttribute("data-src"),
    ];
    let primary = null;
    for (const candidate of primaryCandidates) {
      const parsed = asWebp(candidate);
      if (parsed) { primary = parsed; break; }
    }
    const retained = [...records.values()];
    if (!primary && retained.length) primary = retained[0];
    const secondary = primary
      ? retained.filter((item) => item.path.toLowerCase() !== primary.path.toLowerCase())
      : retained;

    return {
      proofFound: Boolean(proof),
      primaryProofWebpFilename: primary ? primary.filename : null,
      primaryProofWebpPath: primary ? primary.path : null,
      retainedProofWebpFilenames: retained.map((item) => item.filename),
      retainedProofWebpPaths: retained.map((item) => item.path),
      secondaryProofWebpFilenames: secondary.map((item) => item.filename),
      secondaryProofWebpPaths: secondary.map((item) => item.path),
    };
  });
}

function filenameKey(value) {
  return String(value || "").trim().toLowerCase();
}

function proofResourceGate(proofManifest, initial, full) {
  const initialNames = new Set(initial.transfer.resourceFilenames.map(filenameKey));
  const fullNames = new Set(full.transfer.resourceFilenames.map(filenameKey));
  const secondaryLoadedBeforeScroll = proofManifest.secondaryProofWebpFilenames
    .filter((filename) => initialNames.has(filenameKey(filename)));
  const retainedLoadedAfterTraversal = proofManifest.retainedProofWebpFilenames
    .filter((filename) => fullNames.has(filenameKey(filename)));
  const retainedMissingAfterTraversal = proofManifest.retainedProofWebpFilenames
    .filter((filename) => !fullNames.has(filenameKey(filename)));
  return {
    initialResourceFilenames: initial.transfer.resourceFilenames,
    primaryProofWebpFilename: proofManifest.primaryProofWebpFilename,
    retainedProofWebpFilenames: proofManifest.retainedProofWebpFilenames,
    secondaryProofWebpFilenames: proofManifest.secondaryProofWebpFilenames,
    secondaryLoadedBeforeScroll,
    retainedLoadedAfterTraversal,
    retainedMissingAfterTraversal,
    secondaryDeferredPass: secondaryLoadedBeforeScroll.length === 0,
    retainedLoadedPass: proofManifest.proofFound &&
      proofManifest.retainedProofWebpFilenames.length > 0 &&
      retainedMissingAfterTraversal.length === 0,
  };
}

async function traverseProof(page) {
  return page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const proof = document.querySelector("#proof");
    const main = document.querySelector("[data-proof-main]");
    const tabs = proof ? Array.from(proof.querySelectorAll("[data-slide]")) : [];
    if (!proof) return { found: false, tabs: tabs.length, decodedTabs: 0, images: [] };

    proof.scrollIntoView({ behavior: "auto", block: "start" });
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await delay(180);

    let decodedTabs = 0;
    for (const tab of tabs) {
      tab.click();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (main && typeof main.decode === "function") {
        try { await main.decode(); decodedTabs += 1; } catch (_error) {}
      } else if (main && main.complete && main.naturalWidth > 0) {
        decodedTabs += 1;
      }
      await delay(80);
    }

    const images = Array.from(proof.querySelectorAll("img"));
    await Promise.all(images.map(async (image) => {
      image.loading = "eager";
      if (typeof image.decode === "function") {
        try { await image.decode(); } catch (_error) {}
      }
    }));
    return {
      found: true,
      tabs: tabs.length,
      decodedTabs,
      images: images.map((image) => ({
        src: new URL(image.currentSrc || image.src, location.href).pathname,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      })),
    };
  });
}

async function traverseFullPage(page) {
  const geometry = await page.evaluate(() => ({
    height: Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0),
    viewportHeight: window.innerHeight,
  }));
  const step = Math.max(240, Math.floor(geometry.viewportHeight * 0.75));
  const positions = [];
  for (let y = 0; y < geometry.height; y += step) positions.push(y);
  if (!positions.length || positions[positions.length - 1] !== geometry.height) positions.push(geometry.height);
  for (const y of positions) {
    await page.evaluate((scrollY) => window.scrollTo({ top: scrollY, left: 0, behavior: "auto" }), y);
    await page.waitForTimeout(100);
  }
  const decode = await page.evaluate(async () => {
    const images = Array.from(document.images);
    await Promise.all(images.map(async (image) => {
      image.loading = "eager";
      if (typeof image.decode === "function") {
        try { await image.decode(); } catch (_error) {}
      }
    }));
    return {
      total: images.length,
      decoded: images.filter((image) => image.complete && image.naturalWidth > 0).length,
      broken: images.filter((image) => !image.complete || image.naturalWidth < 1).map((image) => ({
        src: new URL(image.currentSrc || image.src, location.href).pathname,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
      })),
      finalScrollY: window.scrollY,
      scrollHeight: document.documentElement.scrollHeight,
    };
  });
  return { positionsVisited: positions.length, stepPx: step, geometry, decode };
}

function finiteOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function round(value, digits = 2) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function sampleAssertions(run) {
  const initialBudget = run.kind === "mobile" ? BUDGETS.mobileInitialBytes : BUDGETS.desktopInitialBytes;
  const metrics = run.initial.metrics;
  const items = [
    ["fcp", metrics.fcpMs != null && metrics.fcpMs <= BUDGETS.fcpMs, metrics.fcpMs, BUDGETS.fcpMs, "ms", "<="],
    ["lcp", metrics.lcpMs != null && metrics.lcpMs <= BUDGETS.lcpMs, metrics.lcpMs, BUDGETS.lcpMs, "ms", "<="],
    ["cls-hard-max", metrics.cls != null && metrics.cls <= BUDGETS.clsMax, metrics.cls, BUDGETS.clsMax, "score", "<="],
    ["cls-target", metrics.cls != null && metrics.cls <= BUDGETS.clsTarget, metrics.cls, BUDGETS.clsTarget, "score", "<="],
    ["tbt-proxy", metrics.tbtProxyMs != null && metrics.tbtProxyMs <= BUDGETS.tbtProxyMs, metrics.tbtProxyMs, BUDGETS.tbtProxyMs, "ms", "<="],
    ["initial-transfer", run.initial.transfer.bytes <= initialBudget, run.initial.transfer.bytes, initialBudget, "bytes", "<="],
    ["full-after-proof-transfer", run.full.transfer.bytes <= BUDGETS.fullAfterProofBytes, run.full.transfer.bytes, BUDGETS.fullAfterProofBytes, "bytes", "<="],
    [
      "secondary-proof-webp-before-scroll",
      run.proofResourceGate.secondaryDeferredPass,
      run.proofResourceGate.secondaryLoadedBeforeScroll.length,
      0,
      "files",
      "==",
      {
        secondaryProofWebpFilenames: run.proofResourceGate.secondaryProofWebpFilenames,
        loadedBeforeScroll: run.proofResourceGate.secondaryLoadedBeforeScroll,
        initialResourceFilenames: run.proofResourceGate.initialResourceFilenames,
      },
    ],
    [
      "retained-proof-webp-after-traversal",
      run.proofResourceGate.retainedLoadedPass,
      run.proofResourceGate.retainedLoadedAfterTraversal.length,
      run.proofResourceGate.retainedProofWebpFilenames.length,
      "files",
      "==",
      {
        retainedProofWebpFilenames: run.proofResourceGate.retainedProofWebpFilenames,
        loadedAfterTraversal: run.proofResourceGate.retainedLoadedAfterTraversal,
        missingAfterTraversal: run.proofResourceGate.retainedMissingAfterTraversal,
      },
    ],
  ];
  return items.map(([metric, pass, actual, budget, unit, operator, details]) => ({
    scope: run.id,
    metric,
    pass: Boolean(pass),
    actual: finiteOrNull(actual),
    budget,
    unit,
    operator,
    ...(details ? { details } : {}),
  }));
}

async function runSample(profile, index) {
  const id = `${profile.id}-cold-${String(index).padStart(2, "0")}`;
  const context = await browser.newContext({
    viewport: { width: profile.width, height: profile.height },
    isMobile: profile.kind === "mobile",
    hasTouch: profile.kind === "mobile",
    deviceScaleFactor: 1,
    colorScheme: "light",
    locale: "ru-RU",
    reducedMotion: "no-preference",
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const ledger = installCdpNetworkLedger(cdp);
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(String(message.text()).replace(/\s+/g, " ").slice(0, 500));
  });
  page.on("pageerror", (error) => {
    pageErrors.push(String(error && (error.stack || error.message) || error).replace(/\s+/g, " ").slice(0, 1000));
  });

  const origin = new URL(serverHandle.baseUrl).origin;
  await configureCdp(cdp, origin);

  const startedAt = new Date().toISOString();
  await page.goto(auditUrl(profile, index), { waitUntil: "load", timeout: 45_000 });
  const initialIdle = await waitForCdpIdle(page, ledger, { idleMs: 750, timeoutMs: 20_000 });
  await page.waitForTimeout(1000);
  const initial = await collectSnapshot(page);
  initial.cdp = ledger.snapshot(["initial"]);
  const proofManifest = await collectProofManifest(page);

  ledger.setStage("proof");
  const proof = await traverseProof(page);
  const proofIdle = await waitForCdpIdle(page, ledger, { idleMs: 750, timeoutMs: 20_000 });

  ledger.setStage("full-page");
  const fullPage = await traverseFullPage(page);
  const fullIdle = await waitForCdpIdle(page, ledger, { idleMs: 750, timeoutMs: 20_000 });
  await page.waitForTimeout(250);
  const full = await collectSnapshot(page);
  full.cdp = ledger.snapshot(["initial", "proof", "full-page"]);
  const resourceGate = proofResourceGate(proofManifest, initial, full);

  const connection = await page.evaluate(() => {
    const value = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return value ? {
      effectiveType: value.effectiveType,
      downlink: value.downlink,
      rtt: value.rtt,
      saveData: value.saveData,
    } : null;
  });
  const userAgent = await page.evaluate(() => navigator.userAgent);
  const run = {
    id,
    profile: profile.id,
    kind: profile.kind,
    viewport: { width: profile.width, height: profile.height, deviceScaleFactor: 1 },
    coldRun: true,
    startedAt,
    finishedAt: new Date().toISOString(),
    emulation: {
      network: NETWORK,
      cpuThrottlingRate: CPU_THROTTLING_RATE,
      navigatorConnectionObserved: connection,
    },
    userAgent,
    initialIdle,
    proofIdle,
    fullIdle,
    initial,
    proofManifest,
    proofResourceGate: resourceGate,
    proof,
    fullPage,
    full,
    diagnostics: { consoleErrors, pageErrors },
  };
  run.assertions = sampleAssertions(run);
  await context.close();
  return run;
}

function statistics(values) {
  const sorted = values.filter(Number.isFinite).slice().sort((a, b) => a - b);
  if (!sorted.length) return { count: 0, min: null, median: null, max: null };
  const midpoint = Math.floor(sorted.length / 2);
  const median = sorted.length % 2
    ? sorted[midpoint]
    : (sorted[midpoint - 1] + sorted[midpoint]) / 2;
  return {
    count: sorted.length,
    min: round(sorted[0]),
    median: round(median),
    max: round(sorted[sorted.length - 1]),
  };
}

function aggregateRuns(runs) {
  return {
    samples: runs.length,
    fcpMs: statistics(runs.map((run) => run.initial.metrics.fcpMs)),
    lcpMs: statistics(runs.map((run) => run.initial.metrics.lcpMs)),
    cls: statistics(runs.map((run) => run.initial.metrics.cls)),
    tbtProxyMs: statistics(runs.map((run) => run.initial.metrics.tbtProxyMs)),
    initialTransferBytes: statistics(runs.map((run) => run.initial.transfer.bytes)),
    initialCdpEncodedBytes: statistics(runs.map((run) => run.initial.cdp.transferBytes)),
    fullTransferBytes: statistics(runs.map((run) => run.full.transfer.bytes)),
    fullCdpEncodedBytes: statistics(runs.map((run) => run.full.cdp.transferBytes)),
    secondaryProofBeforeScrollCount: statistics(runs.map((run) => run.proofResourceGate.secondaryLoadedBeforeScroll.length)),
    retainedProofMissingAfterTraversalCount: statistics(runs.map((run) => run.proofResourceGate.retainedMissingAfterTraversal.length)),
    retainedProofCount: statistics(runs.map((run) => run.proofResourceGate.retainedProofWebpFilenames.length)),
    responseStartMs: statistics(runs.map((run) => run.initial.metrics.responseStartMs)),
    domContentLoadedMs: statistics(runs.map((run) => run.initial.metrics.domContentLoadedMs)),
    loadEventEndMs: statistics(runs.map((run) => run.initial.metrics.loadEventEndMs)),
  };
}

function addAggregateAssertions() {
  const mobile = report.aggregates.mobile;
  const desktop = report.aggregates.desktop;
  const earlySecondary = report.runs.flatMap((run) => run.proofResourceGate.secondaryLoadedBeforeScroll.map((filename) => ({ run: run.id, filename })));
  const missingRetained = report.runs.flatMap((run) => run.proofResourceGate.retainedMissingAfterTraversal.map((filename) => ({ run: run.id, filename })));
  const emptyRetained = report.runs.filter((run) => run.proofResourceGate.retainedProofWebpFilenames.length === 0).map((run) => run.id);
  const checks = [
    ["mobile-median-fcp", mobile.fcpMs.median != null && mobile.fcpMs.median <= BUDGETS.fcpMs, mobile.fcpMs.median, BUDGETS.fcpMs, "ms"],
    ["mobile-median-lcp", mobile.lcpMs.median != null && mobile.lcpMs.median <= BUDGETS.lcpMs, mobile.lcpMs.median, BUDGETS.lcpMs, "ms"],
    ["mobile-median-cls-target", mobile.cls.median != null && mobile.cls.median <= BUDGETS.clsTarget, mobile.cls.median, BUDGETS.clsTarget, "score"],
    ["mobile-max-cls-hard-limit", mobile.cls.max != null && mobile.cls.max <= BUDGETS.clsMax, mobile.cls.max, BUDGETS.clsMax, "score"],
    ["mobile-median-tbt-proxy", mobile.tbtProxyMs.median != null && mobile.tbtProxyMs.median <= BUDGETS.tbtProxyMs, mobile.tbtProxyMs.median, BUDGETS.tbtProxyMs, "ms"],
    ["mobile-max-initial-transfer", mobile.initialTransferBytes.max != null && mobile.initialTransferBytes.max <= BUDGETS.mobileInitialBytes, mobile.initialTransferBytes.max, BUDGETS.mobileInitialBytes, "bytes"],
    ["mobile-max-full-transfer", mobile.fullTransferBytes.max != null && mobile.fullTransferBytes.max <= BUDGETS.fullAfterProofBytes, mobile.fullTransferBytes.max, BUDGETS.fullAfterProofBytes, "bytes"],
    ["desktop-fcp", desktop.fcpMs.median != null && desktop.fcpMs.median <= BUDGETS.fcpMs, desktop.fcpMs.median, BUDGETS.fcpMs, "ms"],
    ["desktop-lcp", desktop.lcpMs.median != null && desktop.lcpMs.median <= BUDGETS.lcpMs, desktop.lcpMs.median, BUDGETS.lcpMs, "ms"],
    ["desktop-cls-target", desktop.cls.median != null && desktop.cls.median <= BUDGETS.clsTarget, desktop.cls.median, BUDGETS.clsTarget, "score"],
    ["desktop-cls-hard-limit", desktop.cls.max != null && desktop.cls.max <= BUDGETS.clsMax, desktop.cls.max, BUDGETS.clsMax, "score"],
    ["desktop-tbt-proxy", desktop.tbtProxyMs.median != null && desktop.tbtProxyMs.median <= BUDGETS.tbtProxyMs, desktop.tbtProxyMs.median, BUDGETS.tbtProxyMs, "ms"],
    ["desktop-initial-transfer", desktop.initialTransferBytes.max != null && desktop.initialTransferBytes.max <= BUDGETS.desktopInitialBytes, desktop.initialTransferBytes.max, BUDGETS.desktopInitialBytes, "bytes"],
    ["desktop-full-transfer", desktop.fullTransferBytes.max != null && desktop.fullTransferBytes.max <= BUDGETS.fullAfterProofBytes, desktop.fullTransferBytes.max, BUDGETS.fullAfterProofBytes, "bytes"],
    [
      "all-samples-secondary-proof-webp-deferred",
      earlySecondary.length === 0,
      earlySecondary.length,
      0,
      "files",
      "==",
      { loadedBeforeScroll: earlySecondary },
    ],
    [
      "all-samples-retained-proof-webp-loaded",
      missingRetained.length === 0 && emptyRetained.length === 0,
      missingRetained.length,
      0,
      "files",
      "==",
      { missingAfterTraversal: missingRetained, runsWithoutRetainedProof: emptyRetained },
    ],
  ];
  report.assertions.push(...checks.map(([metric, pass, actual, budget, unit, operator = "<=", details]) => ({
    scope: "aggregate",
    metric,
    pass: Boolean(pass),
    actual: finiteOrNull(actual),
    budget,
    unit,
    operator,
    ...(details ? { details } : {}),
  })));
}

function fmtMs(value) {
  return value == null ? "n/a" : `${round(value, 1)} мс`;
}

function fmtScore(value) {
  return value == null ? "n/a" : String(round(value, 4));
}

function fmtKib(value) {
  return value == null ? "n/a" : `${round(value / KIB, 1)} КиБ`;
}

function fmtCount(value) {
  return value == null ? "n/a" : String(round(value, 0));
}

function triple(stat, formatter) {
  return `${formatter(stat.min)} / ${formatter(stat.median)} / ${formatter(stat.max)}`;
}

function passMark(pass) {
  return pass ? "PASS" : "FAIL";
}

function aggregateAssertion(metric) {
  return report.assertions.find((item) => item.scope === "aggregate" && item.metric === metric);
}

function markdownReport() {
  const mobile = report.aggregates.mobile;
  const desktop = report.aggregates.desktop;
  const failed = report.assertions.filter((item) => !item.pass);
  const observerTypes = ["paint", "largest-contentful-paint", "layout-shift", "longtask"];
  const observerUnavailable = observerTypes.filter((type) => report.runs.some((run) => !run.initial.observer.supported[type]));
  const runtimeErrors = report.runs.reduce((sum, run) => sum + run.diagnostics.consoleErrors.length + run.diagnostics.pageErrors.length, 0);
  return `# SOL Performance v2.4\n\n` +
    `**Итог: ${passMark(report.result.pass)}.** Выполнено 5 холодных мобильных прогонов 390×844 и 1 холодный десктопный прогон 1440×1000.\n\n` +
    `## Ключевые результаты\n\n` +
    `Значения для mobile: минимум / медиана / максимум.\n\n` +
    `| Метрика | Mobile min / median / max | Бюджет | Итог |\n` +
    `|---|---:|---:|---|\n` +
    `| FCP | ${triple(mobile.fcpMs, fmtMs)} | ≤ ${BUDGETS.fcpMs} мс | ${passMark(aggregateAssertion("mobile-median-fcp").pass)} |\n` +
    `| LCP | ${triple(mobile.lcpMs, fmtMs)} | ≤ ${BUDGETS.lcpMs} мс | ${passMark(aggregateAssertion("mobile-median-lcp").pass)} |\n` +
    `| CLS | ${triple(mobile.cls, fmtScore)} | target ≤ ${BUDGETS.clsTarget}; max ≤ ${BUDGETS.clsMax} | ${passMark(aggregateAssertion("mobile-median-cls-target").pass && aggregateAssertion("mobile-max-cls-hard-limit").pass)} |\n` +
    `| TBT proxy* | ${triple(mobile.tbtProxyMs, fmtMs)} | ≤ ${BUDGETS.tbtProxyMs} мс | ${passMark(aggregateAssertion("mobile-median-tbt-proxy").pass)} |\n` +
    `| Initial transfer | ${triple(mobile.initialTransferBytes, fmtKib)} | ≤ ${BUDGETS.mobileInitialBytes / KIB} КиБ | ${passMark(aggregateAssertion("mobile-max-initial-transfer").pass)} |\n` +
    `| Full after proof | ${triple(mobile.fullTransferBytes, fmtKib)} | ≤ ${BUDGETS.fullAfterProofBytes / MIB} МиБ | ${passMark(aggregateAssertion("mobile-max-full-transfer").pass)} |\n` +
    `| Secondary proof WebP до scroll | ${triple(mobile.secondaryProofBeforeScrollCount, fmtCount)} | 0 файлов | ${passMark(aggregateAssertion("all-samples-secondary-proof-webp-deferred").pass)} |\n` +
    `| Retained proof WebP не загружены после traversal | ${triple(mobile.retainedProofMissingAfterTraversalCount, fmtCount)} | 0 файлов | ${passMark(aggregateAssertion("all-samples-retained-proof-webp-loaded").pass)} |\n\n` +
    `Desktop (1 прогон): FCP ${fmtMs(desktop.fcpMs.median)}, LCP ${fmtMs(desktop.lcpMs.median)}, CLS ${fmtScore(desktop.cls.median)}, TBT proxy ${fmtMs(desktop.tbtProxyMs.median)}, initial ${fmtKib(desktop.initialTransferBytes.median)}, full ${fmtKib(desktop.fullTransferBytes.median)}. Агрегатный результат: ${passMark([
      "desktop-fcp", "desktop-lcp", "desktop-cls-target", "desktop-cls-hard-limit", "desktop-tbt-proxy", "desktop-initial-transfer", "desktop-full-transfer",
    ].every((metric) => aggregateAssertion(metric).pass))}.\n\n` +
    `Proof resource hard gate: ${passMark(aggregateAssertion("all-samples-secondary-proof-webp-deferred").pass && aggregateAssertion("all-samples-retained-proof-webp-loaded").pass)}.\n\n` +
    `## Проверено\n\n` +
    `- HTTP-кэш очищался и отключался через CDP перед каждым прогоном; origin storage очищался, service worker обходился.\n` +
    `- Через CDP эмулировались 150 мс latency, 1,6 Мбит/с download, 750 Кбит/с upload, cellular4g и CPU ×4.\n` +
    `- PerformanceObserver устанавливался до навигации для FCP/LCP/CLS/longtask.\n` +
    `- Initial transfer посчитан до взаимодействия. Затем скрипт прокрутил proof, переключил и декодировал все кадры, прошёл всю страницу шагами и декодировал все изображения; после этого посчитан full transfer.\n` +
    `- В JSON сохранены initial resource filenames по каждому прогону; secondary proof WebP до scroll и отсутствующие retained proof WebP после traversal являются hard failures.\n` +
    `- Дополнительно сохранён независимый CDP encodedDataLength ledger по каждому запросу. Ошибок console/page: ${runtimeErrors}.\n\n` +
    `## Ограничения и риски\n\n` +
    `- *TBT proxy — сумма блокирующих частей longtask после FCP до первичного среза. Это **не Lighthouse TBT**: Lighthouse/TTI/trace-модель не запускались.\n` +
    `- LCP — последний кандидат, замеченный observer до первой программной прокрутки; это лабораторный, а не полевой CrUX-показатель.\n` +
    `- Transfer Size взят из Navigation/Resource Timing; CDP encodedDataLength сохранён отдельно и может отличаться из-за учёта заголовков/протокола.\n` +
    `- Недоступные observer-типы: ${observerUnavailable.length ? observerUnavailable.join(", ") : "нет"}.\n` +
    `- Непройденных assertions: ${failed.length}${failed.length ? ` (${failed.map((item) => `${item.scope}:${item.metric}`).join(", ")})` : ""}.\n\n` +
    `Полные данные и ресурсные записи: \`artifacts/sol-performance-v2-4/performance-report.json\`. Скрипт: \`scripts/sol_perf_v2_2.cjs\`.\n`;
}

function finalizeLimitations() {
  const unavailable = new Set();
  for (const run of report.runs) {
    for (const type of ["paint", "largest-contentful-paint", "layout-shift", "longtask"]) {
      if (!run.initial.observer.supported[type]) unavailable.add(type);
    }
    if (run.initial.observer.errors.length) {
      report.limitations.push({ run: run.id, type: "observer-errors", details: run.initial.observer.errors });
    }
    if (run.initialIdle.timedOut || run.proofIdle.timedOut || run.fullIdle.timedOut) {
      report.limitations.push({
        run: run.id,
        type: "network-idle-timeout",
        details: { initial: run.initialIdle, proof: run.proofIdle, full: run.fullIdle },
      });
    }
  }
  if (unavailable.size) {
    report.limitations.push({
      type: "performance-observer-unavailable",
      entryTypes: [...unavailable],
      impact: "Affected metrics are null and their assertions fail rather than being inferred.",
    });
  }
  report.limitations.push({
    type: "tbt-proxy-not-lighthouse",
    impact: "Long-task blocking proxy is not Lighthouse TBT because Lighthouse TTI and trace attribution are intentionally absent.",
  });
  report.limitations.push({
    type: "lab-only",
    impact: "One local machine and a loopback HTTP server under synthetic throttling do not substitute for field RUM/CrUX.",
  });
}

async function main() {
  safeOutputReset();
  serverHandle = await startStaticServer();
  browser = await launchExistingBrowser();
  report.environment = {
    node: process.version,
    playwright: require("playwright/package.json").version,
    browser: "chromium",
    browserVersion: browser.version(),
    headless: true,
    server: { scheme: "http", host: serverHandle.host, port: serverHandle.port, loopbackOnly: true, cacheControl: "no-store" },
  };

  for (const profile of PROFILES) {
    for (let index = 1; index <= profile.runs; index += 1) {
      const run = await runSample(profile, index);
      report.runs.push(run);
      process.stdout.write(`${run.id}: FCP=${round(run.initial.metrics.fcpMs, 1)}ms LCP=${round(run.initial.metrics.lcpMs, 1)}ms CLS=${round(run.initial.metrics.cls, 4)} TBT-proxy=${round(run.initial.metrics.tbtProxyMs, 1)}ms initial=${round(run.initial.transfer.bytes / KIB, 1)}KiB full=${round(run.full.transfer.bytes / KIB, 1)}KiB proof-early=${run.proofResourceGate.secondaryLoadedBeforeScroll.length} proof-missing=${run.proofResourceGate.retainedMissingAfterTraversal.length}\n`);
    }
  }

  const mobileRuns = report.runs.filter((run) => run.kind === "mobile");
  const desktopRuns = report.runs.filter((run) => run.kind === "desktop");
  report.aggregates = {
    mobile: aggregateRuns(mobileRuns),
    desktop: aggregateRuns(desktopRuns),
  };
  report.initialResourceFilenames = report.runs.map((run) => ({
    run: run.id,
    filenames: run.initial.transfer.resourceFilenames,
  }));
  report.proofResourceGate = {
    pass: report.runs.every((run) => run.proofResourceGate.secondaryDeferredPass && run.proofResourceGate.retainedLoadedPass),
    samples: report.runs.map((run) => ({
      run: run.id,
      primaryProofWebpFilename: run.proofResourceGate.primaryProofWebpFilename,
      retainedProofWebpFilenames: run.proofResourceGate.retainedProofWebpFilenames,
      secondaryProofWebpFilenames: run.proofResourceGate.secondaryProofWebpFilenames,
      secondaryLoadedBeforeScroll: run.proofResourceGate.secondaryLoadedBeforeScroll,
      retainedLoadedAfterTraversal: run.proofResourceGate.retainedLoadedAfterTraversal,
      retainedMissingAfterTraversal: run.proofResourceGate.retainedMissingAfterTraversal,
      pass: run.proofResourceGate.secondaryDeferredPass && run.proofResourceGate.retainedLoadedPass,
    })),
  };
  report.assertions.push(...report.runs.flatMap((run) => run.assertions));
  addAggregateAssertions();
  finalizeLimitations();
  report.finishedAt = new Date().toISOString();
  const hardSampleFailures = report.assertions.filter((item) => !item.pass && item.metric !== "cls-target");
  const targetFailures = report.assertions.filter((item) => !item.pass && item.metric === "cls-target");
  report.result = {
    pass: hardSampleFailures.length === 0 && targetFailures.length === 0,
    assertionCount: report.assertions.length,
    passedAssertions: report.assertions.filter((item) => item.pass).length,
    failedAssertions: report.assertions.filter((item) => !item.pass).length,
    failed: report.assertions.filter((item) => !item.pass).map((item) => ({
      scope: item.scope,
      metric: item.metric,
      actual: item.actual,
      budget: item.budget,
      unit: item.unit,
      operator: item.operator,
      ...(item.details ? { details: item.details } : {}),
    })),
  };
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(MD_PATH, markdownReport(), "utf8");
  process.stdout.write(`Result=${passMark(report.result.pass)}; report=${path.relative(ROOT, JSON_PATH)}\n`);
}

main().catch((error) => {
  report.finishedAt = new Date().toISOString();
  report.result = { pass: false, fatalError: String(error && (error.stack || error.message) || error) };
  try {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  } catch (_writeError) {}
  process.stderr.write(`${error && (error.stack || error.message) || error}\n`);
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close().catch(() => {});
  if (serverHandle) await serverHandle.close().catch(() => {});
});
