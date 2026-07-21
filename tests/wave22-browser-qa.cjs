const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.WAVE22_BASE_URL || "http://127.0.0.1:4173/";
const experimentId = "wave22_ya_search_polish_proof_first";
const proofPath = "assets/polish-real-before-after-v9.webp";
const proofDir = path.join(__dirname, "..", "proof", "2026-07-21-wave22");

const viewports = [
  { name: "mobile-320x568", width: 320, height: 568 },
  { name: "mobile-360x640", width: 360, height: 640 },
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "desktop-1440x1000", width: 1440, height: 1000 }
];

function variantUrl(viewportName) {
  const url = new URL(baseUrl);
  url.searchParams.set("utm_source", "yandex");
  url.searchParams.set("utm_medium", "cpc");
  url.searchParams.set("utm_campaign", experimentId);
  url.searchParams.set("utm_content", viewportName);
  url.searchParams.set("scenario", "used-car");
  url.searchParams.set("experiment_id", experimentId);
  return url.toString();
}

async function main() {
  fs.mkdirSync(proofDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = { generatedAt: new Date().toISOString(), control: {}, viewports: [] };

  try {
    const controlContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const controlPage = await controlContext.newPage();
    const controlRequests = [];
    controlPage.on("request", request => controlRequests.push(request.url()));
    const controlUrl = new URL(baseUrl);
    controlUrl.searchParams.set("utm_campaign", experimentId);
    controlUrl.searchParams.set("scenario", "used-car");
    await controlPage.goto(controlUrl.toString(), { waitUntil: "networkidle" });
    report.control = await controlPage.evaluate(proofAsset => {
      const proof = document.querySelector(".polish-photo-visual img");
      return {
        experiment: document.documentElement.getAttribute("data-ohtaawa-experiment"),
        headline: document.querySelector("h1")?.textContent.trim(),
        proofSrc: proof?.getAttribute("src") || "",
        proofDataSrc: proof?.getAttribute("data-src") || "",
        proofSectionDisplay: getComputedStyle(document.querySelector(".polish-photo-band")).display,
        assetExpected: proofAsset
      };
    }, proofPath);
    report.control.proofRequested = controlRequests.some(url => url.includes(proofPath));
    assert.equal(report.control.experiment, null, "Control must not activate wave22 from utm_campaign alone");
    assert.equal(report.control.proofSrc, "", "Control must not eagerly set the proof image src");
    assert.equal(report.control.proofRequested, false, "Control must not request the hidden proof image");
    assert.equal(report.control.proofSectionDisplay, "none", "Control must keep the wave22 proof section hidden");
    await controlContext.close();

    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      page.on("console", message => {
        if (message.type() === "error" && !message.text().includes("ERR_BLOCKED_BY_CLIENT")) {
          consoleErrors.push(message.text());
        }
      });
      page.on("pageerror", error => pageErrors.push(error.message));
      await page.goto(variantUrl(viewport.name), { waitUntil: "networkidle" });
      await page.waitForSelector('html[data-ohtaawa-experiment="wave22-polish-proof-first"]');
      await page.waitForTimeout(250);

      const result = await page.evaluate(({ expectedExperiment, expectedProof }) => {
        const ctaRow = document.querySelector(".hero .messenger-row");
        const proof = document.querySelector(".polish-photo-visual img");
        const reviews = document.querySelector("#reviews");
        const reviewLink = document.querySelector('a[href="#reviews"]');
        const generatedImage = document.querySelector(".inspection-visual img");
        const ctaRect = ctaRow.getBoundingClientRect();
        const allText = document.body.innerText;
        return {
          experiment: document.documentElement.getAttribute("data-ohtaawa-experiment"),
          experimentId: window.ohtaawaExperimentId,
          headline: document.querySelector("h1")?.textContent.trim(),
          ctaTop: Math.round(ctaRect.top),
          ctaBottom: Math.round(ctaRect.bottom),
          ctaVisibleInFirstViewport: ctaRect.top >= 0 && ctaRect.bottom <= window.innerHeight,
          viewportHeight: window.innerHeight,
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          proofSrc: proof?.getAttribute("src") || "",
          proofComplete: Boolean(proof?.complete && proof?.naturalWidth > 0),
          proofAssetSource: proof?.getAttribute("data-asset-source") || "",
          generatedAssetSource: generatedImage?.getAttribute("data-asset-source") || "",
          generatedAlt: generatedImage?.getAttribute("alt") || "",
          reviewsDisplay: getComputedStyle(reviews).display,
          reviewLinkHref: reviewLink?.getAttribute("href") || "",
          reviewsHeading: reviews?.querySelector(".section-head h2")?.textContent.trim() || "",
          hasDisallowedServiceCopy: allText.includes("Первое фото — рекламная визуализация"),
          expectedExperiment,
          expectedProof
        };
      }, { expectedExperiment: experimentId, expectedProof: proofPath });
      await page.screenshot({
        path: path.join(proofDir, `${viewport.name}-hero-v4.png`),
        fullPage: false
      });

      await page.evaluate(() => {
        const telegram = document.querySelector('.hero [data-ohtaawa-location="hero"][data-ohtaawa-event="lead_telegram_polish_film_v8"]');
        telegram.addEventListener("click", event => event.preventDefault(), { capture: true, once: true });
      });
      await page.locator('.hero [data-ohtaawa-location="hero"][data-ohtaawa-event="lead_telegram_polish_film_v8"]').click();
      await page.waitForTimeout(50);
      result.telegramEvent = await page.evaluate(expectedExperiment => {
        const events = (window.dataLayer || []).filter(item => item.event_name === "lead_telegram_polish_film_v8");
        const event = events.at(-1) || {};
        return {
          name: event.event_name || "",
          experimentId: event.experiment_id || "",
          scenario: event.scenario || "",
          location: event.location || "",
          destination: event.destination || "",
          valid: event.experiment_id === expectedExperiment && event.scenario === "used-car" && event.location === "hero" && event.destination === "telegram"
        };
      }, experimentId);
      await page.locator(".inspection-visual").scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      result.generatedImageComplete = await page.locator(".inspection-visual img").evaluate(image => Boolean(image.complete && image.naturalWidth > 0));
      await page.locator("#reviews").scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      await page.locator("#reviews").screenshot({ path: path.join(proofDir, `${viewport.name}-reviews-v4.png`) });
      result.consoleErrors = consoleErrors;
      result.pageErrors = pageErrors;
      report.viewports.push({ viewport, ...result });
      fs.writeFileSync(path.join(proofDir, "qa-v4.partial.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
      process.stdout.write(`${viewport.name}: CTA ${result.ctaTop}-${result.ctaBottom} / ${result.viewportHeight}\n`);
      if (viewport.width >= 1000) {
        await page.screenshot({ path: path.join(proofDir, `${viewport.name}-full-v4.png`), fullPage: true });
      }

      assert.equal(result.experiment, "wave22-polish-proof-first");
      assert.equal(result.experimentId, experimentId);
      assert.equal(result.ctaVisibleInFirstViewport, true, `${viewport.name}: CTA must fit inside the first viewport`);
      assert.equal(result.horizontalOverflow, false, `${viewport.name}: page must not overflow horizontally`);
      assert.equal(result.proofSrc.endsWith(proofPath), true, `${viewport.name}: proof src must be activated`);
      assert.equal(result.proofComplete, true, `${viewport.name}: proof image must render`);
      assert.equal(result.proofAssetSource, "owner-provided-real-before-after");
      assert.equal(result.generatedAssetSource, "generated-illustrative");
      assert.equal(result.generatedAlt, "Иллюстрация процесса полировки кузова");
      assert.equal(result.generatedImageComplete, true, `${viewport.name}: illustrative polishing image must render after scroll`);
      assert.notEqual(result.reviewsDisplay, "none", `${viewport.name}: reviews must remain visible`);
      assert.equal(result.reviewLinkHref, "#reviews", `${viewport.name}: review navigation must remain valid`);
      assert.equal(result.telegramEvent.valid, true, `${viewport.name}: CTA payload must preserve cohort attribution`);
      assert.deepEqual(result.pageErrors, [], `${viewport.name}: page errors found`);

      await context.close();
    }
  } finally {
    await browser.close();
  }

  const reportPath = path.join(proofDir, "qa-v4.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(`${reportPath}\n`);
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
