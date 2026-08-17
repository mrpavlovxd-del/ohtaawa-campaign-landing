"use strict";

const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT_SLUG = "sol-motion-v2-3";
const OUTPUT_DIR = path.resolve(ROOT, "artifacts", OUTPUT_SLUG);
const SCREENSHOT_DIR = path.join(OUTPUT_DIR, "screenshots");
const VIDEO_DIR = path.join(OUTPUT_DIR, "videos");
const REPORT_PATH = path.join(OUTPUT_DIR, "report.json");
const QA_EXPERIMENT_ID = "sol_motion_proof_v2_3";
const LOOPBACK_HOST = "127.0.0.1";
const NORMAL_PROFILES = Object.freeze([
  {
    id: "desktop-1440x1000",
    width: 1440,
    height: 1000,
    isMobile: false,
    hasTouch: false,
    pointerProof: true,
  },
  {
    id: "mobile-390x844",
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
    pointerProof: false,
  },
]);

const report = {
  schema: "ohtaawa-sol-motion-proof-v2.3/1",
  startedAt: new Date().toISOString(),
  finishedAt: null,
  runner: "scripts/sol_motion_proof_v2_3.cjs",
  root: ".",
  output: path.relative(ROOT, OUTPUT_DIR).replace(/\\/g, "/"),
  server: null,
  browser: null,
  sources: [],
  scenarios: [],
  screenshots: [],
  videos: [],
  checks: [],
  runtimeErrors: [],
  serverRequests: [],
  summary: null,
};

let browser = null;
let serverHandle = null;
let outputPrepared = false;

function compact(value, max = 600) {
  return String(value == null ? "" : value).replace(/\s+/g, " ").trim().slice(0, max);
}

function errorDetails(error) {
  return {
    name: compact(error && error.name ? error.name : "Error", 120),
    message: compact(error && error.message ? error.message : error, 1200),
    stack: compact(error && error.stack ? error.stack : "", 3000),
  };
}

function addCheck(scope, id, pass, details = {}) {
  const item = {
    scope,
    id,
    pass: Boolean(pass),
    details,
  };
  report.checks.push(item);
  return item.pass;
}

function isPathInside(parent, candidate) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function prepareOutput() {
  const artifactsDir = path.resolve(ROOT, "artifacts");
  const exactExpected = path.resolve(artifactsDir, OUTPUT_SLUG);
  if (OUTPUT_DIR !== exactExpected || path.dirname(OUTPUT_DIR) !== artifactsDir || path.basename(OUTPUT_DIR) !== OUTPUT_SLUG) {
    throw new Error(`Refusing unsafe output path: ${OUTPUT_DIR}`);
  }
  if (fs.existsSync(OUTPUT_DIR) && fs.lstatSync(OUTPUT_DIR).isSymbolicLink()) {
    throw new Error(`Refusing to clean a symbolic-link output path: ${OUTPUT_DIR}`);
  }

  // The only recursive cleanup in this runner is this exact, guarded directory.
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
  outputPrepared = true;
}

function sourceFingerprint(relativePath) {
  const absolute = path.resolve(ROOT, relativePath);
  if (!isPathInside(ROOT, absolute) || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    addCheck("source", `source.${relativePath.replace(/\\/g, "/")}.exists`, false, { relativePath });
    return;
  }
  const data = fs.readFileSync(absolute);
  report.sources.push({
    path: relativePath.replace(/\\/g, "/"),
    bytes: data.length,
    sha256: crypto.createHash("sha256").update(data).digest("hex"),
  });
  addCheck("source", `source.${relativePath.replace(/\\/g, "/")}.exists`, true, { bytes: data.length });
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

async function createLoopbackStaticServer() {
  const realRoot = fs.realpathSync(ROOT);
  const server = http.createServer((request, response) => {
    const requestRecord = {
      method: request.method || "GET",
      url: compact(request.url, 1000),
      host: compact(request.headers.host, 200),
      saveData: compact(request.headers["save-data"], 40),
    };
    report.serverRequests.push(requestRecord);

    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url || "/", `http://${LOOPBACK_HOST}`).pathname);
    } catch (_error) {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Bad request");
      return;
    }

    const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^[/\\]+/, "");
    let candidate = path.resolve(ROOT, relativePath);
    if (!isPathInside(ROOT, candidate)) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    try {
      if (fs.statSync(candidate).isDirectory()) candidate = path.join(candidate, "index.html");
      const realCandidate = fs.realpathSync(candidate);
      if (!isPathInside(realRoot, realCandidate)) {
        response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Forbidden");
        return;
      }
      const data = fs.readFileSync(realCandidate);
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Length": data.length,
        "Content-Type": contentType(realCandidate),
        "X-Content-Type-Options": "nosniff",
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
    server.listen(0, LOOPBACK_HOST, resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string" || address.address !== LOOPBACK_HOST) {
    await new Promise((resolve) => server.close(resolve));
    throw new Error("Static server did not bind to the required IPv4 loopback address");
  }

  return {
    host: address.address,
    port: address.port,
    baseUrl: `http://${LOOPBACK_HOST}:${address.port}/`,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    }),
  };
}

async function launchBrowser() {
  const explicitExecutable = process.env.SOL_MOTION_CHROME_PATH;
  if (explicitExecutable) {
    if (!fs.existsSync(explicitExecutable)) {
      throw new Error(`SOL_MOTION_CHROME_PATH does not exist: ${explicitExecutable}`);
    }
    const instance = await chromium.launch({ headless: true, executablePath: explicitExecutable });
    report.browser = { route: "SOL_MOTION_CHROME_PATH", executablePath: explicitExecutable };
    return instance;
  }

  try {
    const instance = await chromium.launch({ headless: true });
    report.browser = { route: "playwright-chromium" };
    return instance;
  } catch (bundledError) {
    try {
      const instance = await chromium.launch({ headless: true, channel: "chrome" });
      report.browser = { route: "installed-chrome", bundledError: compact(bundledError.message, 700) };
      return instance;
    } catch (chromeError) {
      throw new Error(
        `Unable to launch Playwright Chromium or installed Chrome: ${compact(bundledError.message, 700)}; ${compact(chromeError.message, 700)}`,
      );
    }
  }
}

function qaUrl(scenarioId) {
  const url = new URL(serverHandle.baseUrl);
  const params = {
    qa: "1",
    utm_source: "codex",
    utm_medium: "qa",
    utm_campaign: QA_EXPERIMENT_ID,
    utm_content: "fullfilm_price",
    scenario: "full-film",
    experiment_id: QA_EXPERIMENT_ID,
    proof_case: scenarioId,
  };
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.toString();
}

function isLoopbackUrl(rawUrl) {
  try {
    const hostname = new URL(rawUrl).hostname.toLowerCase();
    return hostname === "127.0.0.1" || hostname === "localhost" || hostname === "::1" || hostname === "[::1]";
  } catch (_error) {
    return false;
  }
}

function isMetrikaUrl(rawUrl) {
  const normalized = String(rawUrl || "").toLowerCase();
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();
    return host === "mc.yandex.ru" || host.endsWith(".mc.yandex.ru") ||
      host === "mc.yandex.com" || host.endsWith(".mc.yandex.com") ||
      host.includes("metrika.yandex") || parsed.pathname.startsWith("/watch/");
  } catch (_error) {
    return normalized.includes("mc.yandex") || normalized.includes("metrika") || normalized.includes("/watch/");
  }
}

function installDiagnostics(page, scenarioId) {
  const diagnostics = {
    scenarioId,
    active: true,
    consoleFailures: [],
    pageErrors: [],
    crashes: [],
    requestFailures: [],
    httpFailures: [],
    externalRequests: [],
    metrikaRequests: [],
    documentRequests: [],
  };

  page.on("console", (message) => {
    if (!diagnostics.active || !["error", "warning", "assert"].includes(message.type())) return;
    diagnostics.consoleFailures.push({ type: message.type(), text: compact(message.text(), 1400) });
  });
  page.on("pageerror", (error) => {
    if (diagnostics.active) diagnostics.pageErrors.push(errorDetails(error));
  });
  page.on("crash", () => {
    if (diagnostics.active) diagnostics.crashes.push({ message: "page crashed" });
  });
  page.on("requestfailed", (request) => {
    if (!diagnostics.active) return;
    diagnostics.requestFailures.push({
      method: request.method(),
      resourceType: request.resourceType(),
      url: compact(request.url(), 1200),
      error: compact(request.failure() ? request.failure().errorText : "unknown", 500),
    });
  });
  page.on("response", (response) => {
    if (!diagnostics.active || response.status() < 400) return;
    diagnostics.httpFailures.push({ status: response.status(), url: compact(response.url(), 1200) });
  });
  page.on("request", (request) => {
    if (!diagnostics.active) return;
    const item = {
      method: request.method(),
      resourceType: request.resourceType(),
      url: compact(request.url(), 1200),
    };
    if (request.resourceType() === "document") {
      const headers = request.headers();
      diagnostics.documentRequests.push({ ...item, saveData: headers["save-data"] || "" });
    }
    if (!isLoopbackUrl(request.url()) && !request.url().startsWith("data:") && !request.url().startsWith("blob:")) {
      diagnostics.externalRequests.push(item);
    }
    if (isMetrikaUrl(request.url())) diagnostics.metrikaRequests.push(item);
  });
  return diagnostics;
}

function finishDiagnostics(scope, diagnostics) {
  diagnostics.active = false;
  addCheck(scope, "runtime.no-console-failures", diagnostics.consoleFailures.length === 0, {
    failures: diagnostics.consoleFailures,
  });
  addCheck(scope, "runtime.no-page-errors", diagnostics.pageErrors.length === 0, {
    failures: diagnostics.pageErrors,
  });
  addCheck(scope, "runtime.no-page-crashes", diagnostics.crashes.length === 0, {
    failures: diagnostics.crashes,
  });
  addCheck(scope, "runtime.no-network-failures",
    diagnostics.requestFailures.length === 0 && diagnostics.httpFailures.length === 0,
    { requestFailures: diagnostics.requestFailures, httpFailures: diagnostics.httpFailures });
  addCheck(scope, "qa.no-metrika-network", diagnostics.metrikaRequests.length === 0, {
    metrikaRequests: diagnostics.metrikaRequests,
    externalRequests: diagnostics.externalRequests,
  });
}

async function installInitScript(context, { saveData = false } = {}) {
  await context.addInitScript(({ forceSaveData }) => {
    document.addEventListener("click", (event) => {
      const anchor = event.target && event.target.closest ? event.target.closest("a[href]") : null;
      const href = anchor ? String(anchor.getAttribute("href") || "").trim() : "";
      if (anchor && href && !href.startsWith("#")) event.preventDefault();
    }, true);
    window.open = () => null;

    if (forceSaveData) {
      const connection = {
        saveData: true,
        effectiveType: "4g",
        downlink: 10,
        rtt: 50,
        onchange: null,
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() { return true; },
      };
      for (const property of ["connection", "mozConnection", "webkitConnection"]) {
        let installed = false;
        try {
          Object.defineProperty(window.navigator, property, {
            configurable: true,
            enumerable: true,
            get: () => connection,
          });
          installed = true;
        } catch (_error) {}
        if (!installed) {
          try {
            Object.defineProperty(Navigator.prototype, property, {
              configurable: true,
              enumerable: true,
              get: () => connection,
            });
          } catch (_error) {}
        }
      }
      Object.defineProperty(window, "__solMotionSaveDataInjected", {
        value: true,
        configurable: false,
        writable: false,
      });
    }
  }, { forceSaveData: saveData });
}

async function waitForApp(page) {
  await page.locator("main").waitFor({ state: "visible", timeout: 20_000 });
  await page.waitForLoadState("load", { timeout: 20_000 });
  await page.waitForLoadState("networkidle", { timeout: 20_000 });
  await page.waitForFunction(() => Boolean(window.ohtaawaAnalytics && window.ohtaawaAnalytics.isQa), null, {
    timeout: 10_000,
  });
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(250);
}

function screenshotTarget(scenarioId, state) {
  const safeName = `${scenarioId}--${state}`.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
  const target = path.resolve(SCREENSHOT_DIR, `${safeName}.png`);
  if (!isPathInside(SCREENSHOT_DIR, target)) throw new Error(`Unsafe screenshot path: ${target}`);
  return target;
}

function videoTarget(scenarioId) {
  const safeName = scenarioId.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
  const target = path.resolve(VIDEO_DIR, `${safeName}.webm`);
  if (!isPathInside(VIDEO_DIR, target)) throw new Error(`Unsafe video path: ${target}`);
  return target;
}

function readPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.length < 24 || buffer.toString("hex", 0, 8) !== "89504e470d0a1a0a") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function captureScreenshot(page, scope, state, expectedViewport) {
  const target = screenshotTarget(scope, state);
  await page.screenshot({ path: target, fullPage: false, caret: "hide" });
  const dimensions = readPngDimensions(target);
  const relativePath = path.relative(ROOT, target).replace(/\\/g, "/");
  report.screenshots.push({ scope, state, path: relativePath, dimensions });
  addCheck(scope, `screenshot.${state}.viewport-size`, Boolean(dimensions) &&
    dimensions.width === expectedViewport.width && dimensions.height === expectedViewport.height,
  { path: relativePath, dimensions, expected: expectedViewport });
}

async function finalizeVideo(scope, video) {
  if (!video) {
    addCheck(scope, "video.recorded", false, { error: "Playwright returned no Video object" });
    return;
  }
  try {
    const rawPath = await video.path();
    const target = videoTarget(scope);
    if (path.resolve(rawPath) !== target) fs.renameSync(rawPath, target);
    const stat = fs.statSync(target);
    const relativePath = path.relative(ROOT, target).replace(/\\/g, "/");
    report.videos.push({ scope, path: relativePath, bytes: stat.size });
    addCheck(scope, "video.recorded", stat.isFile() && stat.size > 1024, {
      path: relativePath,
      bytes: stat.size,
    });
  } catch (error) {
    addCheck(scope, "video.recorded", false, errorDetails(error));
  }
}

async function animationSnapshot(page) {
  return page.evaluate(() => {
    const describeElement = (element) => {
      if (!element) return null;
      if (element.id) return `#${element.id}`;
      const classes = Array.from(element.classList || []).slice(0, 3);
      return `${String(element.tagName || "node").toLowerCase()}${classes.map((name) => `.${name}`).join("")}`;
    };
    const serialNumber = (value) => value === Infinity ? "Infinity" :
      (Number.isFinite(Number(value)) ? Number(Number(value).toFixed(3)) : String(value));
    const animationsAvailable = typeof document.getAnimations === "function";
    const animations = animationsAvailable ? document.getAnimations({ subtree: true }).map((animation, index) => {
      const effect = animation.effect || null;
      let timing = {};
      let computed = {};
      try { timing = effect && effect.getTiming ? effect.getTiming() : {}; } catch (_error) {}
      try { computed = effect && effect.getComputedTiming ? effect.getComputedTiming() : {}; } catch (_error) {}
      return {
        index,
        type: animation.constructor ? animation.constructor.name : "Animation",
        animationName: typeof animation.animationName === "string" ? animation.animationName : null,
        transitionProperty: typeof animation.transitionProperty === "string" ? animation.transitionProperty : null,
        playState: animation.playState,
        pending: animation.pending,
        currentTime: serialNumber(animation.currentTime),
        playbackRate: serialNumber(animation.playbackRate),
        target: describeElement(effect && effect.target),
        pseudoElement: effect && effect.pseudoElement ? effect.pseudoElement : null,
        duration: serialNumber(timing.duration),
        delay: serialNumber(timing.delay),
        iterations: serialNumber(timing.iterations),
        endTime: serialNumber(computed.endTime),
        activeDuration: serialNumber(computed.activeDuration),
      };
    }) : [];

    const computedInfiniteDeclarations = [];
    const elements = Array.from(document.querySelectorAll("*"));
    for (const element of elements) {
      for (const pseudo of [null, "::before", "::after"]) {
        let style;
        try { style = getComputedStyle(element, pseudo); } catch (_error) { continue; }
        const names = String(style.animationName || "none").split(",").map((item) => item.trim());
        const iterations = String(style.animationIterationCount || "1").split(",").map((item) => item.trim());
        if (names.some((name) => name !== "none") && iterations.some((value) => value === "infinite")) {
          computedInfiniteDeclarations.push({
            target: describeElement(element),
            pseudoElement: pseudo,
            animationName: style.animationName,
            animationDuration: style.animationDuration,
            animationIterationCount: style.animationIterationCount,
          });
        }
      }
    }

    const infiniteAnimations = animations.filter((item) => item.iterations === "Infinity" ||
      item.endTime === "Infinity" || item.activeDuration === "Infinity");
    return {
      animationsAvailable,
      animationCount: animations.length,
      animations: animations.slice(0, 100),
      infiniteAnimations,
      computedInfiniteDeclarations: computedInfiniteDeclarations.slice(0, 100),
    };
  });
}

async function recordNoInfiniteAnimationCheck(page, scope, stage) {
  const snapshot = await animationSnapshot(page);
  addCheck(scope, `motion.${stage}.get-animations-available`, snapshot.animationsAvailable, {
    animationCount: snapshot.animationCount,
  });
  addCheck(scope, `motion.${stage}.no-infinite-animation`, snapshot.animationsAvailable &&
    snapshot.infiniteAnimations.length === 0 && snapshot.computedInfiniteDeclarations.length === 0,
  snapshot);
  return snapshot;
}

async function motionSuppressionSnapshot(page) {
  return page.evaluate(() => {
    const describeElement = (element) => {
      if (!element) return null;
      if (element.id) return `#${element.id}`;
      const classes = Array.from(element.classList || []).slice(0, 3);
      return `${String(element.tagName || "node").toLowerCase()}${classes.map((name) => `.${name}`).join("")}`;
    };
    const timeToMs = (value) => {
      const token = String(value || "0s").trim().toLowerCase();
      const numeric = Number.parseFloat(token);
      if (!Number.isFinite(numeric)) return 0;
      return token.endsWith("ms") ? numeric : numeric * 1000;
    };
    const maxCssTime = (value) => Math.max(0, ...String(value || "0s").split(",").map(timeToMs));
    const serialNumber = (value) => value === Infinity ? "Infinity" :
      (Number.isFinite(Number(value)) ? Number(Number(value).toFixed(3)) : String(value));
    const violations = [];

    for (const element of Array.from(document.querySelectorAll("*"))) {
      for (const pseudo of [null, "::before", "::after"]) {
        let style;
        try { style = getComputedStyle(element, pseudo); } catch (_error) { continue; }
        const names = String(style.animationName || "none").split(",").map((item) => item.trim());
        const iterations = String(style.animationIterationCount || "1").split(",").map((item) => item.trim());
        const animationDurationMs = maxCssTime(style.animationDuration);
        const transitionDurationMs = maxCssTime(style.transitionDuration);
        const hasAnimation = names.some((name) => name !== "none");
        const repeated = iterations.some((value) => value === "infinite" || Number.parseFloat(value) > 1);
        if ((hasAnimation && (animationDurationMs > 1 || repeated)) || transitionDurationMs > 1) {
          violations.push({
            target: describeElement(element),
            pseudoElement: pseudo,
            animationName: style.animationName,
            animationDuration: style.animationDuration,
            animationIterationCount: style.animationIterationCount,
            transitionProperty: style.transitionProperty,
            transitionDuration: style.transitionDuration,
          });
        }
      }
    }

    const animationsAvailable = typeof document.getAnimations === "function";
    const activeLongAnimations = [];
    if (animationsAvailable) {
      for (const animation of document.getAnimations({ subtree: true })) {
        const effect = animation.effect || null;
        let timing = {};
        let computed = {};
        try { timing = effect && effect.getTiming ? effect.getTiming() : {}; } catch (_error) {}
        try { computed = effect && effect.getComputedTiming ? effect.getComputedTiming() : {}; } catch (_error) {}
        const duration = Number(timing.duration);
        const iterations = timing.iterations;
        const activeDuration = computed.activeDuration;
        if (duration > 1 || iterations === Infinity || Number(iterations) > 1 || activeDuration === Infinity || Number(activeDuration) > 1) {
          activeLongAnimations.push({
            type: animation.constructor ? animation.constructor.name : "Animation",
            animationName: typeof animation.animationName === "string" ? animation.animationName : null,
            playState: animation.playState,
            target: describeElement(effect && effect.target),
            duration: serialNumber(duration),
            iterations: serialNumber(iterations),
            activeDuration: serialNumber(activeDuration),
          });
        }
      }
    }

    const revealViolations = Array.from(document.querySelectorAll("[data-reveal]")).filter((element) => {
      const style = getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && style.transform !== "none";
    }).map((element) => ({ target: describeElement(element), transform: getComputedStyle(element).transform }));
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return {
      animationsAvailable,
      prefersReducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      bodySaveDataClass: document.body.classList.contains("save-data"),
      navigatorSaveData: Boolean(connection && connection.saveData),
      analyticsSaveData: Boolean(window.ohtaawaAnalytics && window.ohtaawaAnalytics.saveData),
      qaMode: Boolean(window.ohtaawaAnalytics && window.ohtaawaAnalytics.isQa),
      htmlScrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      violations: violations.slice(0, 150),
      activeLongAnimations: activeLongAnimations.slice(0, 100),
      revealViolations: revealViolations.slice(0, 100),
    };
  });
}

async function metrikaDomSnapshot(page) {
  return page.evaluate(() => ({
    qaParam: new URLSearchParams(location.search).get("qa"),
    analyticsExists: Boolean(window.ohtaawaAnalytics),
    analyticsQa: Boolean(window.ohtaawaAnalytics && window.ohtaawaAnalytics.isQa),
    ymType: typeof window.ym,
    yandexCounterGlobals: Object.keys(window).filter((key) => /^yaCounter\d+$/i.test(key)).slice(0, 20),
    metrikaNodes: Array.from(document.querySelectorAll("script[src], img[src], iframe[src], link[href]")).filter((element) => {
      const value = element.getAttribute("src") || element.getAttribute("href") || "";
      return /mc\.yandex|metrika|\/watch\//i.test(value);
    }).map((element) => ({ tag: element.tagName.toLowerCase(), url: element.src || element.href || "" })).slice(0, 30),
  }));
}

async function recordMetrikaDomCheck(page, scope) {
  const snapshot = await metrikaDomSnapshot(page);
  addCheck(scope, "qa.metrika-disabled-in-qa-1", snapshot.qaParam === "1" && snapshot.analyticsExists &&
    snapshot.analyticsQa && snapshot.ymType === "undefined" && snapshot.yandexCounterGlobals.length === 0 &&
    snapshot.metrikaNodes.length === 0,
  snapshot);
}

async function auditImages(page) {
  return page.evaluate(async () => {
    const waitForElement = (image, timeoutMs) => new Promise((resolve) => {
      if (image.complete) {
        resolve();
        return;
      }
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(finish, timeoutMs);
      image.addEventListener("load", finish, { once: true });
      image.addEventListener("error", finish, { once: true });
    });
    const results = await Promise.all(Array.from(document.images).map(async (image, index) => {
      const declared = image.currentSrc || image.getAttribute("src") || image.getAttribute("data-src") || "";
      const item = {
        index,
        alt: String(image.alt || "").slice(0, 240),
        declared,
        mode: image.currentSrc || image.getAttribute("src") ? "element" : "data-src-probe",
        complete: false,
        naturalWidth: 0,
        naturalHeight: 0,
        decodeError: null,
      };
      if (!declared) {
        item.decodeError = "missing src/currentSrc/data-src";
        return item;
      }

      if (item.mode === "element") {
        image.loading = "eager";
        await waitForElement(image, 7000);
        if (typeof image.decode === "function" && image.complete && image.naturalWidth > 0) {
          try { await image.decode(); } catch (error) { item.decodeError = String(error && error.message ? error.message : error).slice(0, 500); }
        }
        item.complete = image.complete;
        item.naturalWidth = image.naturalWidth;
        item.naturalHeight = image.naturalHeight;
        return item;
      }

      const probe = new Image();
      const loadResult = await new Promise((resolve) => {
        const timer = setTimeout(() => resolve("timeout"), 7000);
        probe.addEventListener("load", () => { clearTimeout(timer); resolve("load"); }, { once: true });
        probe.addEventListener("error", () => { clearTimeout(timer); resolve("error"); }, { once: true });
        probe.src = declared;
      });
      if (loadResult === "load" && typeof probe.decode === "function") {
        try { await probe.decode(); } catch (error) { item.decodeError = String(error && error.message ? error.message : error).slice(0, 500); }
      } else if (loadResult !== "load") {
        item.decodeError = loadResult;
      }
      item.complete = probe.complete;
      item.naturalWidth = probe.naturalWidth;
      item.naturalHeight = probe.naturalHeight;
      return item;
    }));
    const broken = results.filter((item) => !item.complete || item.naturalWidth < 1 || item.naturalHeight < 1 || item.decodeError);
    return { imageCount: results.length, broken, results };
  });
}

async function auditOverflow(page) {
  return page.evaluate(() => {
    const describeElement = (element) => {
      if (element.id) return `#${element.id}`;
      const classes = Array.from(element.classList || []).slice(0, 3);
      return `${String(element.tagName || "node").toLowerCase()}${classes.map((name) => `.${name}`).join("")}`;
    };
    const root = document.documentElement;
    const body = document.body;
    const leakingElements = [];
    for (const element of Array.from(document.querySelectorAll("body *"))) {
      if (element.matches(".skip-link:not(:focus)")) continue;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const verticallyRelevant = rect.bottom > -1 && rect.top < window.innerHeight + 1;
      if (!verticallyRelevant || style.display === "none" || style.visibility === "hidden" || rect.width <= 0 || rect.height <= 0) continue;
      if (rect.left >= -1 && rect.right <= window.innerWidth + 1) continue;

      let containedByOverflow = false;
      for (let ancestor = element.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
        const ancestorStyle = getComputedStyle(ancestor);
        const ancestorRect = ancestor.getBoundingClientRect();
        if (["auto", "scroll", "hidden", "clip"].includes(ancestorStyle.overflowX) &&
          ancestorRect.left >= -1 && ancestorRect.right <= window.innerWidth + 1) {
          containedByOverflow = true;
          break;
        }
      }
      if (!containedByOverflow) {
        leakingElements.push({
          target: describeElement(element),
          left: Number(rect.left.toFixed(2)),
          right: Number(rect.right.toFixed(2)),
          width: Number(rect.width.toFixed(2)),
        });
      }
    }

    const originalX = window.scrollX;
    const originalY = window.scrollY;
    window.scrollTo(999999, originalY);
    const horizontalScrollPosition = window.scrollX;
    window.scrollTo(originalX, originalY);
    return {
      viewportWidth: window.innerWidth,
      rootClientWidth: root.clientWidth,
      rootScrollWidth: root.scrollWidth,
      bodyScrollWidth: body ? body.scrollWidth : 0,
      horizontalScrollPosition,
      leakingElements: leakingElements.slice(0, 50),
    };
  });
}

async function recordIntegrityChecks(page, scope, stage) {
  const images = await auditImages(page);
  addCheck(scope, `integrity.${stage}.no-broken-images`, images.broken.length === 0, {
    imageCount: images.imageCount,
    broken: images.broken,
  });
  const overflow = await auditOverflow(page);
  addCheck(scope, `integrity.${stage}.no-horizontal-overflow`,
    overflow.rootScrollWidth <= overflow.viewportWidth + 1 &&
    overflow.bodyScrollWidth <= overflow.viewportWidth + 1 &&
    overflow.horizontalScrollPosition <= 1 && overflow.leakingElements.length === 0,
  overflow);
}

async function controlledScrollTo(page, selector, durationMs = 900) {
  return page.evaluate(async ({ targetSelector, duration }) => {
    const target = document.querySelector(targetSelector);
    if (!target) return { found: false, selector: targetSelector };
    const header = document.querySelector("[data-header]");
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const startY = window.scrollY;
    const targetY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight);
    const samples = [];
    const started = performance.now();
    await new Promise((resolve) => {
      const frame = (now) => {
        const progress = Math.min(1, (now - started) / duration);
        const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        window.scrollTo(0, startY + (targetY - startY) * eased);
        const elapsed = now - started;
        if (!samples.length || elapsed - samples[samples.length - 1].time >= 90 || progress === 1) {
          samples.push({ time: Number(elapsed.toFixed(1)), y: Number(window.scrollY.toFixed(1)) });
        }
        if (progress < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
    const rect = target.getBoundingClientRect();
    return {
      found: true,
      selector: targetSelector,
      startY: Number(startY.toFixed(1)),
      targetY: Number(targetY.toFixed(1)),
      endY: Number(window.scrollY.toFixed(1)),
      targetTop: Number(rect.top.toFixed(1)),
      headerHeight: Number(headerHeight.toFixed(1)),
      samples,
    };
  }, { targetSelector: selector, duration: durationMs });
}

async function moveDesktopPointer(page) {
  const field = page.locator(".tf-field").first();
  const hero = page.locator(".q-hero").first();
  const box = await field.boundingBox() || await hero.boundingBox();
  if (!box) return { moved: false, reason: "hero pointer target has no bounding box" };
  const points = [
    { x: box.x + box.width * 0.2, y: box.y + box.height * 0.25 },
    { x: box.x + box.width * 0.5, y: box.y + box.height * 0.45 },
    { x: box.x + box.width * 0.78, y: box.y + box.height * 0.68 },
  ];
  for (const point of points) {
    await page.mouse.move(point.x, point.y, { steps: 12 });
    await page.waitForTimeout(140);
  }
  return { moved: true, points: points.map((point) => ({ x: Number(point.x.toFixed(1)), y: Number(point.y.toFixed(1)) })) };
}

async function galleryState(page) {
  return page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll(".q-proof-thumbs [data-slide]"));
    const selectedIndex = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    const main = document.querySelector("[data-proof-main]");
    return {
      tabCount: tabs.length,
      selectedIndex,
      selectedSlide: selectedIndex >= 0 ? tabs[selectedIndex].getAttribute("data-slide") : null,
      counter: document.querySelector("[data-proof-counter]")?.textContent.trim() || "",
      title: document.querySelector("[data-proof-title]")?.textContent.trim() || "",
      mainSrc: main ? (main.currentSrc || main.src || "") : "",
      mainComplete: Boolean(main && main.complete),
      mainNaturalWidth: main ? main.naturalWidth : 0,
      mainNaturalHeight: main ? main.naturalHeight : 0,
    };
  });
}

async function waitForGalleryChange(page, previousIndex) {
  await page.waitForFunction((prior) => {
    const tabs = Array.from(document.querySelectorAll(".q-proof-thumbs [data-slide]"));
    const selectedIndex = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    const main = document.querySelector("[data-proof-main]");
    return selectedIndex >= 0 && selectedIndex !== prior && main && main.complete && main.naturalWidth > 0;
  }, previousIndex, { timeout: 7000 });
  await page.locator("[data-proof-main]").evaluate(async (image) => {
    if (typeof image.decode === "function") await image.decode();
  });
}

async function runManualGalleryProof(page, scope, viewport) {
  const before = await galleryState(page);
  const next = page.locator("[data-proof-next]").first();
  const prev = page.locator("[data-proof-prev]").first();
  const controlsExist = before.tabCount >= 2 && await next.count() === 1 && await prev.count() === 1;
  addCheck(scope, "interaction.proof-manual-controls-exist", controlsExist, { before });
  if (!controlsExist) throw new Error("Manual proof controls are missing");

  await next.click();
  await waitForGalleryChange(page, before.selectedIndex);
  const afterNext = await galleryState(page);
  addCheck(scope, "interaction.proof-next-changes-slide", afterNext.selectedIndex !== before.selectedIndex &&
    afterNext.mainComplete && afterNext.mainNaturalWidth > 0,
  { before, afterNext });
  await captureScreenshot(page, scope, "proof-manual-next", viewport);

  await prev.click();
  await waitForGalleryChange(page, afterNext.selectedIndex);
  const afterPrev = await galleryState(page);
  addCheck(scope, "interaction.proof-prev-restores-slide", afterPrev.selectedIndex === before.selectedIndex,
    { before, afterNext, afterPrev });

  const lastIndex = before.tabCount - 1;
  const lastTab = page.locator(".q-proof-thumbs [data-slide]").nth(lastIndex);
  await lastTab.click();
  if (lastIndex !== afterPrev.selectedIndex) await waitForGalleryChange(page, afterPrev.selectedIndex);
  const afterDirectTab = await galleryState(page);
  addCheck(scope, "interaction.proof-direct-tab-works", afterDirectTab.selectedIndex === lastIndex &&
    afterDirectTab.mainComplete && afterDirectTab.mainNaturalWidth > 0,
  { lastIndex, afterDirectTab });

  await page.waitForTimeout(900);
  const stableState = await galleryState(page);
  addCheck(scope, "interaction.proof-remains-manual-after-input",
    stableState.selectedIndex === afterDirectTab.selectedIndex && stableState.mainSrc === afterDirectTab.mainSrc,
  { afterDirectTab, stableState });
  return { before, afterNext, afterPrev, afterDirectTab, stableState };
}

async function runDialogProof(page, scope, viewport) {
  const trigger = page.locator("[data-header] [data-open-contact], [data-open-contact]").first();
  const dialog = page.locator("#contact-dialog");
  const close = page.locator("[data-close-dialog]").first();
  const exists = await trigger.count() === 1 && await dialog.count() === 1 && await close.count() === 1;
  addCheck(scope, "interaction.dialog-controls-exist", exists, {});
  if (!exists) throw new Error("Dialog controls are missing");

  await trigger.click();
  await page.waitForFunction(() => {
    const node = document.querySelector("#contact-dialog");
    return Boolean(node && node.open && document.body.classList.contains("dialog-open"));
  }, null, { timeout: 5000 });
  const opened = await page.evaluate(() => {
    const node = document.querySelector("#contact-dialog");
    return {
      open: Boolean(node && node.open),
      bodyClass: document.body.classList.contains("dialog-open"),
      activeInside: Boolean(node && node.contains(document.activeElement)),
      activeElement: document.activeElement ? document.activeElement.outerHTML.slice(0, 500) : null,
    };
  });
  addCheck(scope, "interaction.dialog-opens", opened.open && opened.bodyClass && opened.activeInside, opened);
  await captureScreenshot(page, scope, "dialog-open", viewport);
  const openOverflow = await auditOverflow(page);
  addCheck(scope, "interaction.dialog-open-no-horizontal-overflow",
    openOverflow.rootScrollWidth <= openOverflow.viewportWidth + 1 &&
    openOverflow.bodyScrollWidth <= openOverflow.viewportWidth + 1 &&
    openOverflow.horizontalScrollPosition <= 1 && openOverflow.leakingElements.length === 0,
  openOverflow);

  await close.click();
  await page.waitForFunction(() => {
    const node = document.querySelector("#contact-dialog");
    return Boolean(node && !node.open && !document.body.classList.contains("dialog-open"));
  }, null, { timeout: 5000 });
  const closed = await page.evaluate(() => {
    const node = document.querySelector("#contact-dialog");
    const opener = document.querySelector("[data-header] [data-open-contact]") || document.querySelector("[data-open-contact]");
    return {
      open: Boolean(node && node.open),
      bodyClass: document.body.classList.contains("dialog-open"),
      focusReturned: document.activeElement === opener,
    };
  });
  addCheck(scope, "interaction.dialog-closes-and-restores-focus", !closed.open && !closed.bodyClass && closed.focusReturned, closed);
  await captureScreenshot(page, scope, "dialog-closed", viewport);
  return { opened, closed };
}

async function runNormalMotionScenario(profile) {
  const scope = `normal-${profile.id}`;
  const scenario = {
    id: scope,
    kind: "normal-motion",
    viewport: { width: profile.width, height: profile.height },
    pointerProof: profile.pointerProof,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    interactionEvidence: {},
  };
  report.scenarios.push(scenario);

  let context = null;
  let page = null;
  let video = null;
  let diagnostics = null;
  let unexpectedError = null;
  try {
    context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      screen: { width: profile.width, height: profile.height },
      deviceScaleFactor: 1,
      isMobile: profile.isMobile,
      hasTouch: profile.hasTouch,
      colorScheme: "light",
      locale: "ru-RU",
      reducedMotion: "no-preference",
      serviceWorkers: "block",
      recordVideo: {
        dir: VIDEO_DIR,
        size: { width: profile.width, height: profile.height },
      },
    });
    await installInitScript(context);
    page = await context.newPage();
    page.setDefaultTimeout(10_000);
    diagnostics = installDiagnostics(page, scope);
    video = page.video();

    await page.goto(qaUrl(scope), { waitUntil: "domcontentloaded", timeout: 30_000 });
    await recordNoInfiniteAnimationCheck(page, scope, "entrance");
    await waitForApp(page);
    const viewport = await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));
    addCheck(scope, "viewport.exact", viewport.width === profile.width && viewport.height === profile.height, {
      actual: viewport,
      expected: { width: profile.width, height: profile.height },
      videoSize: { width: profile.width, height: profile.height },
    });
    await recordMetrikaDomCheck(page, scope);
    await page.waitForTimeout(650);
    await captureScreenshot(page, scope, "entrance", profile);

    if (profile.pointerProof) {
      const pointer = await moveDesktopPointer(page);
      scenario.interactionEvidence.pointer = pointer;
      addCheck(scope, "interaction.desktop-pointer-move", pointer.moved && pointer.points.length === 3, pointer);
      await captureScreenshot(page, scope, "pointer-hover", profile);
    }

    const nextChapterScroll = await controlledScrollTo(page, "#edge", 1000);
    scenario.interactionEvidence.heroToNextChapter = nextChapterScroll;
    addCheck(scope, "interaction.controlled-scroll-hero-to-next-chapter", nextChapterScroll.found &&
      nextChapterScroll.samples.length >= 5 && Math.abs(nextChapterScroll.endY - nextChapterScroll.targetY) <= 3,
    nextChapterScroll);
    await page.waitForTimeout(300);
    await captureScreenshot(page, scope, "next-chapter", profile);

    const proofScroll = await controlledScrollTo(page, "#proof", 950);
    scenario.interactionEvidence.nextChapterToProof = proofScroll;
    addCheck(scope, "interaction.controlled-scroll-to-proof", proofScroll.found &&
      proofScroll.samples.length >= 5 && Math.abs(proofScroll.endY - proofScroll.targetY) <= 3,
    proofScroll);
    await page.waitForTimeout(300);
    scenario.interactionEvidence.gallery = await runManualGalleryProof(page, scope, profile);
    scenario.interactionEvidence.dialog = await runDialogProof(page, scope, profile);

    await recordNoInfiniteAnimationCheck(page, scope, "after-interactions");
    await recordIntegrityChecks(page, scope, "after-interactions");
    await recordMetrikaDomCheck(page, scope);
    await page.waitForLoadState("networkidle", { timeout: 10_000 });
    addCheck(scope, "scenario.completed", true, {});
  } catch (error) {
    unexpectedError = error;
    const details = errorDetails(error);
    report.runtimeErrors.push({ scope, ...details });
    addCheck(scope, "scenario.completed", false, details);
  } finally {
    scenario.finishedAt = new Date().toISOString();
    if (diagnostics) finishDiagnostics(scope, diagnostics);
    if (context) {
      try {
        await context.close();
      } catch (error) {
        const details = errorDetails(error);
        report.runtimeErrors.push({ scope, phase: "context-close", ...details });
        addCheck(scope, "context.closed", false, details);
      }
    }
    await finalizeVideo(scope, video);
  }
  return !unexpectedError;
}

async function runSuppressedMotionScenario({ id, reducedMotion, saveData, viewport }) {
  const scope = id;
  const scenario = {
    id: scope,
    kind: saveData ? "save-data" : "reduced-motion",
    viewport,
    startedAt: new Date().toISOString(),
    finishedAt: null,
  };
  report.scenarios.push(scenario);

  let context = null;
  let diagnostics = null;
  try {
    context = await browser.newContext({
      viewport,
      screen: viewport,
      deviceScaleFactor: 1,
      isMobile: viewport.width <= 430,
      hasTouch: viewport.width <= 430,
      colorScheme: "light",
      locale: "ru-RU",
      reducedMotion: reducedMotion ? "reduce" : "no-preference",
      serviceWorkers: "block",
      extraHTTPHeaders: saveData ? { "Save-Data": "on" } : undefined,
    });
    await installInitScript(context, { saveData });
    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    diagnostics = installDiagnostics(page, scope);
    await page.goto(qaUrl(scope), { waitUntil: "domcontentloaded", timeout: 30_000 });
    const earlySuppression = await motionSuppressionSnapshot(page);
    await waitForApp(page);
    const settledSuppression = await motionSuppressionSnapshot(page);
    const suppressionPass = settledSuppression.animationsAvailable && settledSuppression.qaMode &&
      settledSuppression.violations.length === 0 && settledSuppression.activeLongAnimations.length === 0 &&
      settledSuppression.revealViolations.length === 0 && settledSuppression.htmlScrollBehavior === "auto" &&
      (saveData ? settledSuppression.bodySaveDataClass && settledSuppression.navigatorSaveData && settledSuppression.analyticsSaveData :
        settledSuppression.prefersReducedMotion);
    addCheck(scope, "motion.no-nonessential-animation", suppressionPass, {
      early: earlySuppression,
      settled: settledSuppression,
    });
    await recordNoInfiniteAnimationCheck(page, scope, "suppressed-mode");

    if (saveData) {
      const documentRequests = diagnostics.documentRequests;
      addCheck(scope, "save-data.request-header-and-runtime-observed",
        documentRequests.some((item) => String(item.saveData).toLowerCase() === "on") &&
        settledSuppression.navigatorSaveData && settledSuppression.analyticsSaveData && settledSuppression.bodySaveDataClass,
      { documentRequests, settled: settledSuppression });
    }

    await recordMetrikaDomCheck(page, scope);
    await recordIntegrityChecks(page, scope, "suppressed-mode");
    await captureScreenshot(page, scope, saveData ? "save-data" : "reduced-motion", viewport);
    await page.waitForLoadState("networkidle", { timeout: 10_000 });
    addCheck(scope, "scenario.completed", true, {});
  } catch (error) {
    const details = errorDetails(error);
    report.runtimeErrors.push({ scope, ...details });
    addCheck(scope, "scenario.completed", false, details);
  } finally {
    scenario.finishedAt = new Date().toISOString();
    if (diagnostics) finishDiagnostics(scope, diagnostics);
    if (context) {
      try {
        await context.close();
      } catch (error) {
        const details = errorDetails(error);
        report.runtimeErrors.push({ scope, phase: "context-close", ...details });
        addCheck(scope, "context.closed", false, details);
      }
    }
  }
}

function writeReport() {
  report.finishedAt = new Date().toISOString();
  const failures = report.checks.filter((check) => !check.pass);
  report.summary = {
    pass: failures.length === 0,
    totalChecks: report.checks.length,
    passedChecks: report.checks.length - failures.length,
    failedChecks: failures.length,
    failedIds: failures.map((check) => `${check.scope}:${check.id}`),
    screenshotCount: report.screenshots.length,
    videoCount: report.videos.length,
    scenarioCount: report.scenarios.length,
  };
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return report.summary.pass;
}

async function main() {
  let fatalError = null;
  prepareOutput();
  try {
    for (const relativePath of [
      "index.html",
      path.join("assets", "qwen-full-film.css"),
      path.join("assets", "qwen-full-film.js"),
      path.join("scripts", "sol_motion_proof_v2_3.cjs"),
    ]) sourceFingerprint(relativePath);

    serverHandle = await createLoopbackStaticServer();
    report.server = {
      host: serverHandle.host,
      port: serverHandle.port,
      baseUrl: serverHandle.baseUrl,
      loopbackOnly: serverHandle.host === LOOPBACK_HOST,
    };
    addCheck("server", "server.loopback-only", serverHandle.host === LOOPBACK_HOST, report.server);
    browser = await launchBrowser();

    for (const profile of NORMAL_PROFILES) await runNormalMotionScenario(profile);
    await runSuppressedMotionScenario({
      id: "reduced-motion-desktop-1440x1000",
      reducedMotion: true,
      saveData: false,
      viewport: { width: 1440, height: 1000 },
    });
    await runSuppressedMotionScenario({
      id: "save-data-mobile-390x844",
      reducedMotion: false,
      saveData: true,
      viewport: { width: 390, height: 844 },
    });
  } catch (error) {
    fatalError = error;
    const details = errorDetails(error);
    report.runtimeErrors.push({ scope: "runner", ...details });
    addCheck("runner", "runner.completed", false, details);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        const details = errorDetails(error);
        report.runtimeErrors.push({ scope: "runner", phase: "browser-close", ...details });
        addCheck("runner", "browser.closed", false, details);
      }
    }
    if (serverHandle) {
      try {
        await serverHandle.close();
      } catch (error) {
        const details = errorDetails(error);
        report.runtimeErrors.push({ scope: "runner", phase: "server-close", ...details });
        addCheck("runner", "server.closed", false, details);
      }
    }

    if (!fatalError) addCheck("runner", "runner.completed", true, {});
    const pass = writeReport();
    process.stdout.write(`[sol-motion-v2-3] ${pass ? "PASS" : "FAIL"}; report: ${REPORT_PATH}\n`);
    if (!pass) process.exitCode = 1;
  }
}

main().catch((error) => {
  const details = errorDetails(error);
  report.runtimeErrors.push({ scope: "uncaught", ...details });
  addCheck("runner", "runner.uncaught", false, details);
  if (outputPrepared) {
    try {
      writeReport();
    } catch (_writeError) {}
  }
  process.stderr.write(`[sol-motion-v2-3] FAIL: ${details.message}\n`);
  process.exitCode = 1;
});
