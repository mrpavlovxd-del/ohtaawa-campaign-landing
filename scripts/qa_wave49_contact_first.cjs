const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const url =
  process.env.OHTAAWA_QA_URL ||
  "http://127.0.0.1:4189/contact-first/?utm_source=codex&utm_medium=qa&utm_campaign=wave49_contact_first_qa&scenario=full-film&experiment_id=wave49_contact_first";
const outputDir =
  process.env.OHTAAWA_QA_OUTPUT ||
  path.resolve(__dirname, "../artifacts/wave49-contact-first-qa");

async function auditViewport(browser, name, viewport) {
  const page = await browser.newPage({ viewport });
  page.setDefaultTimeout(6000);
  const consoleErrors = [];
  const networkErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => networkErrors.push(request.url()));

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.ohtaawaAnalytics));
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((image) => (image.loading = "eager"));
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
  await page.waitForTimeout(300);

  const checks = await page.evaluate(() => {
    const consolePanel = document.querySelector(".contact-console");
    const price = document.querySelector(".hero-price");
    const channels = [...document.querySelectorAll(".hero-contact-list [data-channel]")];
    const visible = (node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
    };
    return {
      title: document.title,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      brokenImages: [...document.images]
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
      heroContactTitle: document.querySelector("#hero-contact-title")?.textContent.trim(),
      heroChannels: channels.map((node) => node.dataset.channel),
      heroChannelsVisible: channels.every(visible),
      contactConsoleVisible: visible(consolePanel),
      priceVisible: visible(price),
      bottomFixedObstructions: [...document.querySelectorAll("body *")]
        .filter((node) => {
          const style = getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return style.position === "fixed" && visible(node) && rect.height >= 40 && rect.bottom >= innerHeight - 1;
        })
        .map((node) => node.className || node.tagName),
      experiment: window.ohtaawaAnalytics?.attribution?.experiment_id,
      isQa: window.ohtaawaAnalytics?.isQa,
      entryLabels: [...document.querySelectorAll("[data-open-contact]")].map((node) =>
        node.textContent.trim(),
      ),
    };
  });

  await page.screenshot({ path: path.join(outputDir, `${name}-hero.png`), fullPage: false });

  await page.evaluate(() => {
    document.querySelectorAll(".hero-contact-list a").forEach((link) => {
      link.addEventListener("click", (event) => event.preventDefault(), { capture: true });
    });
  });
  for (const channel of ["telegram", "whatsapp", "max", "phone"]) {
    await page.locator(`.hero-contact-list [data-channel="${channel}"]`).dispatchEvent("click");
  }
  const events = await page.evaluate(() => window.ohtaawaAnalytics.qaEvents);
  const rememberedSignal = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem("ohtaawa_last_contact_signal") || "null"),
  );

  await page.locator("[data-open-contact][data-contact-location='scope']").scrollIntoViewIfNeeded();
  await page.locator("[data-open-contact][data-contact-location='scope']").click();
  const modalOpen = await page.locator("#contact-sheet").evaluate((dialog) => dialog.open);
  await page.locator("[data-close-contact]").click();

  await page.locator("#proof").scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outputDir, `${name}-proof.png`), fullPage: false });

  await page.close();
  return {
    ...checks,
    noHorizontalOverflow: checks.documentWidth <= checks.viewportWidth + 1,
    modalOpen,
    rememberedSignal,
    channelGoalEvents: events
      .filter((event) => event.event.startsWith("lead_"))
      .map((event) => ({ event: event.event, location: event.payload.location })),
    consoleErrors,
    networkErrors: networkErrors.filter((requestUrl) => !requestUrl.includes("mc.yandex.ru")),
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
    const reports = {
      desktop: await auditViewport(browser, "desktop-1440", { width: 1440, height: 900 }),
      mobile430: await auditViewport(browser, "mobile-430", { width: 430, height: 932 }),
      mobile390: await auditViewport(browser, "mobile-390", { width: 390, height: 844 }),
      mobile360: await auditViewport(browser, "mobile-360", { width: 360, height: 800 }),
    };
    const expectedChannels = "telegram,whatsapp,max,phone";
    const pass = Object.values(reports).every(
      (report) =>
        report.title &&
        report.noHorizontalOverflow &&
        report.brokenImages.length === 0 &&
        report.heroContactTitle === "Узнать ближайшее окно" &&
        report.heroChannels.join(",") === expectedChannels &&
        report.heroChannelsVisible &&
        report.contactConsoleVisible &&
        report.priceVisible &&
        report.bottomFixedObstructions.length === 0 &&
        report.experiment === "wave49_contact_first" &&
        report.isQa &&
        report.entryLabels.every((label) => !/записаться/i.test(label)) &&
        report.modalOpen &&
        report.rememberedSignal?.location === "hero_direct" &&
        report.channelGoalEvents.length === 4 &&
        report.channelGoalEvents.every((event) => event.location === "hero_direct") &&
        report.consoleErrors.length === 0 &&
        report.networkErrors.length === 0,
    );
    const result = { pass, url, reports };
    fs.writeFileSync(path.join(outputDir, "qa.json"), `${JSON.stringify(result, null, 2)}\n`);
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
