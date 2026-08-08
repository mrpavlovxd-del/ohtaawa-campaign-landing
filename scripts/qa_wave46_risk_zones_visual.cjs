const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const url =
  process.env.OHTAAWA_QA_URL ||
  "http://127.0.0.1:4186/risk-zones/?utm_source=codex&utm_medium=qa&utm_campaign=wave46_visual_smoke&scenario=risk-zones&experiment_id=wave46_owner_qa";
const outputDir =
  process.env.OHTAAWA_QA_OUTPUT ||
  path.resolve(
    __dirname,
    "../../../docs/ohtaawa-retargeting/agent-work/2026-08-09/landing-wave46-risk-zones-qa",
  );

async function loadPage(browser, viewport) {
  const page = await browser.newPage({ viewport });
  page.setDefaultTimeout(7000);
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.ohtaawaAnalytics));
  await page.evaluate(async () => {
    [...document.images].forEach((image) => { image.loading = "eager"; });
    await Promise.all([...document.images].map((image) => new Promise((resolve) => {
      if (image.complete) return resolve();
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    })));
  });
  await page.waitForTimeout(760);
  return { page, consoleErrors };
}

async function auditViewport(browser, name, viewport) {
  const { page, consoleErrors } = await loadPage(browser, viewport);
  const staticChecks = await page.evaluate(() => {
    const thumbs = document.querySelector(".carousel-thumbs");
    return {
      title: document.title,
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      brokenImages: [...document.images]
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
      unnamedButtons: [...document.querySelectorAll("button")]
        .filter((button) => !(button.getAttribute("aria-label") || button.getAttribute("title") || button.textContent.trim()))
        .length,
      contactChannels: [...new Set([...document.querySelectorAll("#contact-sheet [data-channel]")]
        .map((node) => node.dataset.channel))],
      bottomFixedObstructions: [...document.querySelectorAll("body *")]
        .filter((node) => {
          const style = getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return style.position === "fixed" &&
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            Number(style.opacity || 1) > 0.05 &&
            rect.width > 0 && rect.height >= 40 && rect.bottom >= window.innerHeight - 1;
        })
        .map((node) => String(node.className || node.tagName)),
      carouselThumbCount: document.querySelectorAll(".carousel-thumbs button").length,
      carouselGridColumnCount: thumbs ? getComputedStyle(thumbs).gridTemplateColumns.split(" ").filter(Boolean).length : 0,
      visibleCtas: [...document.querySelectorAll("[data-open-contact]")]
        .filter((node) => {
          const rect = node.getBoundingClientRect();
          const style = getComputedStyle(node);
          return rect.width > 0 && rect.height > 0 && style.display !== "none";
        }).length,
    };
  });

  await page.screenshot({ path: path.join(outputDir, `${name}-hero.png`) });
  await page.locator("[data-open-contact]:visible").first().click();
  const contactDialogOpen = await page.locator("#contact-sheet").evaluate((dialog) => dialog.open);
  await page.locator("[data-close-contact]").click();

  const before = await page.locator("[data-carousel-main]").getAttribute("src");
  await page.locator("[data-carousel-next]").click();
  await page.waitForTimeout(150);
  const after = await page.locator("[data-carousel-main]").getAttribute("src");
  await page.locator("[data-carousel-open]").click();
  const galleryOpen = await page.locator("#gallery-dialog").evaluate((dialog) => dialog.open);
  await page.locator("[data-gallery-close]").click();

  await page.locator(".faq-list details summary").first().click();
  const faqOpen = await page.locator(".faq-list details").first().evaluate((details) => details.open);

  for (const [selector, suffix] of [
    ["#package", "package"],
    ["#proof", "proof"],
    ["#process", "process"],
    ["#location", "location"],
  ]) {
    await page.evaluate((target) => {
      const node = document.querySelector(target);
      if (node) window.scrollTo({ top: Math.max(0, node.offsetTop - 76), behavior: "instant" });
    }, selector);
    await page.waitForTimeout(760);
    await page.screenshot({ path: path.join(outputDir, `${name}-${suffix}.png`) });
  }

  await page.close();
  return {
    ...staticChecks,
    noHorizontalOverflow: staticChecks.documentWidth <= staticChecks.viewportWidth + 1,
    contactDialogOpen,
    carouselChanged: before !== after,
    galleryOpen,
    faqOpen,
    consoleErrors,
  };
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.OHTAAWA_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  try {
    const reports = {
      desktop: await auditViewport(browser, "desktop-1440", { width: 1440, height: 900 }),
      mobile: await auditViewport(browser, "mobile-390", { width: 390, height: 844 }),
      mobileWide: await auditViewport(browser, "mobile-430", { width: 430, height: 932 }),
    };
    const pass = Object.values(reports).every((report) =>
      report.title && report.noHorizontalOverflow && report.brokenImages.length === 0 &&
      report.unnamedButtons === 0 && report.contactChannels.join(",") === "telegram,whatsapp,max,phone" &&
      report.bottomFixedObstructions.length === 0 && report.carouselThumbCount === 4 &&
      report.carouselGridColumnCount === 4 && report.visibleCtas >= 3 && report.contactDialogOpen &&
      report.carouselChanged && report.galleryOpen && report.faqOpen && report.consoleErrors.length === 0,
    );
    const result = { pass, url, reports };
    fs.writeFileSync(path.join(outputDir, "visual-qa.json"), `${JSON.stringify(result, null, 2)}\n`);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (!pass) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
