const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const url =
  process.env.OHTAAWA_QA_URL ||
  "http://127.0.0.1:4190/color-film/?utm_source=codex&utm_medium=qa&utm_campaign=wave48_visual_smoke&scenario=color-film&experiment_id=wave48_owner_qa";
const outputDir =
  process.env.OHTAAWA_QA_OUTPUT ||
  path.resolve(
    __dirname,
    "../../../docs/ohtaawa-retargeting/agent-work/2026-08-10/landing-wave48-color-film-qa",
  );

async function waitForImages(page) {
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
}

async function revealFullPage(page) {
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.max(320, Math.floor(page.viewportSize().height * 0.72));
  for (let top = 0; top < pageHeight; top += step) {
    await page.evaluate((nextTop) => window.scrollTo({ top: nextTop, behavior: "instant" }), top);
    await page.waitForTimeout(55);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(120);
}

async function auditViewport(browser, name, viewport) {
  const page = await browser.newPage({ viewport });
  page.setDefaultTimeout(7000);
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.ohtaawaAnalytics));
  await waitForImages(page);
  await page.waitForTimeout(250);

  const staticChecks = await page.evaluate(() => {
    const config = JSON.parse(document.getElementById("landing-config")?.textContent || "{}");
    const fixedBottom = [...document.querySelectorAll("body *")]
      .filter((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return (
          style.position === "fixed" &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number(style.opacity || 1) > 0.05 &&
          rect.width > 0 &&
          rect.height >= 40 &&
          rect.bottom >= window.innerHeight - 1
        );
      })
      .map((node) => node.className || node.tagName);

    const heroPrimary = document.querySelector(".cf-hero [data-open-contact]");
    const heroHeading = document.querySelector(".cf-hero h1");
    const heroPrimaryRect = heroPrimary?.getBoundingClientRect();

    return {
      title: document.title,
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      brokenImages: [...document.images]
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
      unnamedButtons: [...document.querySelectorAll("button")]
        .filter(
          (button) =>
            !(
              button.getAttribute("aria-label") ||
              button.getAttribute("title") ||
              button.textContent.trim()
            ),
        )
        .length,
      contactChannels: [...document.querySelectorAll("[data-channel]")].map(
        (node) => node.dataset.channel,
      ),
      fixedBottom,
      dualPerspectiveCount: document.querySelectorAll(".cf-dual-rail [data-slide]").length,
      realProofSources: [...document.querySelectorAll(".cf-dual [data-slide]")].map(
        (node) => node.dataset.src,
      ),
      conceptTargetUsedPublicly: [...document.images].some((image) =>
        image.currentSrc.includes("concept-target"),
      ),
      price: document.querySelector(".cf-hero-price strong")?.textContent.trim(),
      heading: document.querySelector("h1")?.textContent.replace(/\s+/g, " ").trim(),
      heroPrimaryVisible:
        Boolean(heroPrimaryRect) &&
        heroPrimaryRect.top >= 0 &&
        heroPrimaryRect.bottom <= window.innerHeight + 1,
      heroHeadingNoOverflow:
        Boolean(heroHeading) && heroHeading.scrollWidth <= heroHeading.clientWidth + 1,
      config,
    };
  });

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

  await page.locator("#color").scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const proofIntroContained = await page.evaluate(() => {
    const intro = document.querySelector(".cf-dual-intro");
    const heading = intro?.querySelector("h3");
    if (!intro || !heading) return false;
    const introRect = intro.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    return headingRect.left >= introRect.left - 1 && headingRect.right <= introRect.right + 1;
  });
  await page.screenshot({ path: path.join(outputDir, `${name}-proof.png`) });

  await page.locator("#included").scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(outputDir, `${name}-included.png`) });

  await page.locator("#location").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outputDir, `${name}-location.png`) });

  await revealFullPage(page);
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await page.waitForTimeout(200);

  const qaEvents = await page.evaluate(() => window.ohtaawaAnalytics.qaEvents.map((entry) => entry.event));
  const revealFailures = await page.evaluate(() =>
    [...document.querySelectorAll("[data-reveal]")]
      .filter((node) => {
        const rect = node.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0 && !node.classList.contains("is-visible");
      })
      .map((node) => node.className || node.tagName),
  );

  await page.screenshot({ path: path.join(outputDir, `${name}-full.png`), fullPage: true });
  await page.close();

  return {
    ...staticChecks,
    noHorizontalOverflow: staticChecks.documentWidth <= staticChecks.viewportWidth + 1,
    contactDialogOpen,
    proofIntroContained,
    carouselChanged: carouselImageBefore !== carouselImageAfter,
    galleryOpen,
    faqOpen,
    qaEvents,
    revealFailures,
    consoleErrors,
    pageErrors,
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
    const mobileWide = await auditViewport(browser, "mobile-430", { width: 430, height: 932 });
    const reports = { desktop, mobile, mobileWide };
    const pass = Object.values(reports).every(
      (report) =>
        report.title.includes("230 000") &&
        report.noHorizontalOverflow &&
        report.brokenImages.length === 0 &&
        report.unnamedButtons === 0 &&
        report.contactChannels.join(",") === "telegram,whatsapp,max,phone" &&
        report.fixedBottom.length === 0 &&
        report.dualPerspectiveCount === 2 &&
        report.realProofSources.every((source) => source.includes("real-color-film")) &&
        !report.conceptTargetUsedPublicly &&
        report.price === "230 000 ₽" &&
        report.heroPrimaryVisible &&
        report.heroHeadingNoOverflow &&
        report.proofIntroContained &&
        report.config.metrikaCounter === 110584673 &&
        report.config.serviceRoute === "film_color_full" &&
        report.config.offerId === "color_film_fixed_230" &&
        report.config.experimentId === "wave48_control" &&
        report.contactDialogOpen &&
        report.carouselChanged &&
        report.galleryOpen &&
        report.faqOpen &&
        report.qaEvents.includes("landing_view") &&
        report.qaEvents.includes("proof_view_color_film_wave48") &&
        report.qaEvents.includes("offer_terms_view_color_film_wave48") &&
        report.revealFailures.length === 0 &&
        report.consoleErrors.length === 0 &&
        report.pageErrors.length === 0,
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
