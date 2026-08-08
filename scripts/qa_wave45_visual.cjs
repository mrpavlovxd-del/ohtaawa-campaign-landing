const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const url =
  process.env.OHTAAWA_QA_URL ||
  "http://127.0.0.1:4185/?utm_source=codex&utm_medium=qa&utm_campaign=wave45_visual_smoke&scenario=full-film&experiment_id=wave45_owner_qa";
const outputDir =
  process.env.OHTAAWA_QA_OUTPUT ||
  path.resolve(
    __dirname,
    "../../../docs/ohtaawa-retargeting/agent-work/2026-08-08/landing-wave45-final-qa",
  );

async function auditViewport(browser, name, viewport) {
  const page = await browser.newPage({ viewport });
  page.setDefaultTimeout(5000);
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.ohtaawaAnalytics));
  await page.evaluate(async () => {
    const images = [...document.images];
    images.forEach((image) => {
      image.loading = "eager";
    });
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
  await page.waitForTimeout(300);

  const staticChecks = await page.evaluate(() => ({
    title: document.title,
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    brokenImages: [...document.images]
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
    unnamedButtons: [...document.querySelectorAll("button")]
      .filter(
        (button) =>
          !(button.getAttribute("aria-label") || button.getAttribute("title") || button.textContent.trim()),
      )
      .length,
    contactChannels: [...document.querySelectorAll("[data-channel]")].map(
      (node) => node.dataset.channel,
    ),
  }));

  await page.screenshot({ path: path.join(outputDir, `${name}-hero.png`) });

  await page.locator("[data-open-contact]:visible").first().click();
  const contactDialogOpen = await page.locator("#contact-sheet").evaluate((dialog) => dialog.open);
  await page.locator("[data-close-contact]").click();

  const carouselImageBefore = await page.locator("[data-carousel-main]").getAttribute("src");
  await page.locator("[data-carousel-next]").click();
  await page.waitForTimeout(180);
  const carouselImageAfter = await page.locator("[data-carousel-main]").getAttribute("src");
  await page.locator("[data-carousel-open]").click();
  const galleryOpen = await page.locator("#gallery-dialog").evaluate((dialog) => dialog.open);
  await page.locator("[data-gallery-close]").click();

  await page.locator(".faq-list details").first().locator("summary").click();
  const faqOpen = await page.locator(".faq-list details").first().evaluate((details) => details.open);

  await page.locator("#proof").scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outputDir, `${name}-proof.png`) });

  await page.close();

  return {
    ...staticChecks,
    noHorizontalOverflow: staticChecks.documentWidth <= staticChecks.viewportWidth + 1,
    contactDialogOpen,
    carouselChanged: carouselImageBefore !== carouselImageAfter,
    galleryOpen,
    faqOpen,
    consoleErrors,
  };
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.OHTAAWA_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });

  try {
    const desktop = await auditViewport(browser, "desktop-1440", { width: 1440, height: 900 });
    const mobile = await auditViewport(browser, "mobile-390", { width: 390, height: 844 });
    const reports = { desktop, mobile };
    const pass = Object.values(reports).every(
      (report) =>
        report.title &&
        report.noHorizontalOverflow &&
        report.brokenImages.length === 0 &&
        report.unnamedButtons === 0 &&
        report.contactChannels.join(",") === "telegram,whatsapp,max,phone" &&
        report.contactDialogOpen &&
        report.carouselChanged &&
        report.galleryOpen &&
        report.faqOpen &&
        report.consoleErrors.length === 0,
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
