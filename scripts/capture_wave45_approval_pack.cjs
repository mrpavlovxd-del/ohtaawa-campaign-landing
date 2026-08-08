const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

async function main() {
  const input = path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "docs",
    "ohtaawa-retargeting",
    "agent-work",
    "2026-08-08",
    "landing-wave45-final-qa",
    "approval-pack.html",
  );
  const output = path.join(path.dirname(input), "approval-pack.png");
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.OHTAAWA_CHROME_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    await page.goto(pathToFileURL(input).href, { waitUntil: "load" });
    await page.screenshot({ path: output, fullPage: true });
    const proof = await page.evaluate(() => ({
      title: document.title,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).length,
    }));
    const pass =
      proof.scrollWidth <= proof.clientWidth &&
      proof.brokenImages === 0 &&
      consoleErrors.length === 0;
    process.stdout.write(`${JSON.stringify({ pass, output, proof, consoleErrors }, null, 2)}\n`);
    if (!pass) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
