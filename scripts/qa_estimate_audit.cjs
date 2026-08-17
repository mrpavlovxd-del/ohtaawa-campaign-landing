const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const PROOF = path.join(ROOT, "proof", "estimate-check-2026-08-17");
const PORT = 4198;
const TEST_URL = `http://go.detailingspb.ru:${PORT}/estimate-check/?utm_source=qa&utm_medium=codex&utm_campaign=unconventional_quote_audit_2026w34&utm_content=browser_qa&scenario=quote_second_opinion&experiment_id=estimate_audit_w34&_ym_debug=1`;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

function startServer() {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, `http://127.0.0.1:${PORT}`);
    const relative = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\/+/, "");
    const file = path.resolve(ROOT, relative.endsWith("/") ? path.join(relative, "index.html") : relative);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(response);
  });
  return new Promise(resolve => server.listen(PORT, "127.0.0.1", () => resolve(server)));
}

async function inspectViewport(browser, viewport, name) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: name === "mobile" ? 2 : 1 });
  const page = await context.newPage();
  const metrikaRequests = [];
  page.on("request", request => {
    if (request.url().includes("mc.yandex.ru")) metrikaRequests.push(request.url());
  });
  await page.goto(TEST_URL, { waitUntil: "networkidle" });

  const initial = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelectorAll("h1").length,
    fileInputs: document.querySelectorAll('input[type="file"]').length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    qa: window.__OHTAAWA_ESTIMATE_AUDIT__?.isQa,
    scenario: window.__OHTAAWA_ESTIMATE_AUDIT__?.context?.scenario,
    experiment: window.__OHTAAWA_ESTIMATE_AUDIT__?.context?.experiment_id,
    checklistLabels: document.querySelectorAll(".checklist label").length,
    heroCtaVisible: Boolean(document.querySelector('.hero a[href="#audit"]')?.getBoundingClientRect().height)
  }));
  assert.equal(initial.h1, 1);
  assert.equal(initial.fileInputs, 0);
  assert.ok(initial.overflow <= 1, `${name}: horizontal overflow ${initial.overflow}`);
  assert.equal(initial.qa, true);
  assert.equal(initial.scenario, "quote_second_opinion");
  assert.equal(initial.experiment, "estimate_audit_w34");
  assert.equal(initial.checklistLabels, 6);
  assert.equal(initial.heroCtaVisible, true);
  assert.equal(metrikaRequests.length, 0, `${name}: QA must not call Metrika`);

  await page.screenshot({ path: path.join(PROOF, `${name}-hero.png`), fullPage: false, animations: "disabled" });
  await page.locator("#audit").scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(PROOF, `${name}-audit.png`), fullPage: false, animations: "disabled" });

  await page.getByLabel("Полная прозрачная оклейка").check();
  await page.locator('.checklist input[value="scope"]').check();
  await page.locator('.checklist input[value="material"]').check();
  await page.locator('.checklist input[value="prep"]').check();
  await page.getByRole("button", { name: "Показать вопросы к смете" }).click();
  await page.locator("#audit-result").scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(PROOF, `${name}-result.png`), fullPage: false, animations: "disabled" });

  const result = await page.evaluate(() => ({
    index: document.querySelector("#result-index")?.textContent.trim(),
    resultTitle: document.querySelector("#result-title")?.textContent.trim(),
    questionCount: document.querySelectorAll("#result-questions li").length,
    actionHidden: document.querySelector("#result-action")?.hidden,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    events: (window.dataLayer || []).map(item => ({
      name: item.event_name,
      scenario: item.scenario,
      experiment: item.experiment_id,
      service: item.service,
      specified: item.specified_count
    }))
  }));
  assert.equal(result.index, "03 / 06");
  assert.match(result.resultTitle, /Основа есть/);
  assert.equal(result.questionCount, 3);
  assert.equal(result.actionHidden, false);
  assert.ok(result.overflow <= 1, `${name} result: horizontal overflow ${result.overflow}`);
  const resultEvent = result.events.find(item => item.name === "estimate_audit_result_v1");
  assert.equal(resultEvent?.scenario, "quote_second_opinion");
  assert.equal(resultEvent?.experiment, "estimate_audit_w34");
  assert.equal(resultEvent?.service, "Полная прозрачная оклейка");
  assert.equal(resultEvent?.specified, 3);

  await page.locator("#telegram-cta").evaluate(link => {
    link.addEventListener("click", event => event.preventDefault(), { capture: true, once: true });
  });
  await page.locator("#telegram-cta").click();
  const ctaEvents = await page.evaluate(() => (window.dataLayer || []).filter(item =>
    ["lead_telegram_estimate_audit_v1", "lead_telegram_polish_film_v8"].includes(item.event_name)
  ));
  assert.equal(ctaEvents.length, 2);
  assert.ok(ctaEvents.every(item => item.scenario === "quote_second_opinion"));
  assert.ok(ctaEvents.every(item => item.experiment_id === "estimate_audit_w34"));

  await page.locator(".proof-band").scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(PROOF, `${name}-proof.png`), fullPage: false, animations: "disabled" });
  await page.locator(".final-section").scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(PROOF, `${name}-final.png`), fullPage: false, animations: "disabled" });
  const bottom = await page.evaluate(() => ({
    finalCtaVisible: Boolean(document.querySelector("#final-telegram-cta")?.getBoundingClientRect().height),
    proofLink: document.querySelector(".proof-band .text-link")?.getAttribute("href"),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  assert.equal(bottom.finalCtaVisible, true);
  assert.equal(bottom.proofLink, "../risk-zones/");
  assert.ok(bottom.overflow <= 1, `${name} bottom: horizontal overflow ${bottom.overflow}`);

  await context.close();
  return { name, viewport, initial, result, bottom, ctaEvents: ctaEvents.map(item => item.event_name), metrikaRequests: metrikaRequests.length };
}

async function main() {
  fs.mkdirSync(PROOF, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch({
    headless: true,
    args: ["--host-resolver-rules=MAP go.detailingspb.ru 127.0.0.1"]
  });
  try {
    const desktop = await inspectViewport(browser, { width: 1440, height: 1000 }, "desktop");
    const mobile = await inspectViewport(browser, { width: 390, height: 844 }, "mobile");
    const report = {
      verdict: "PASS",
      testedAt: new Date().toISOString(),
      url: TEST_URL,
      viewports: [desktop, mobile],
      publicDeployPerformed: false
    };
    fs.writeFileSync(path.join(PROOF, "qa-report.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ verdict: report.verdict, screenshots: 10, viewports: 2, tracking: "PASS", privacy: "NO_FILE_UPLOAD" }, null, 2));
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
