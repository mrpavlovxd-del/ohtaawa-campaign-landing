const { chromium } = require("playwright");

const baseUrl = process.env.OHTAAWA_QA_URL || "http://127.0.0.1:4185/";
const cases = [
  {
    content: "fullfilm_price",
    eyebrow: "OHTAAWA · Охта Парк",
    leadIncludes: "Премиальная прозрачная полиуретановая пленка",
  },
  {
    content: "newcar_fullfilm",
    eyebrow: "НОВЫЙ АВТОМОБИЛЬ · OHTAAWA",
    leadIncludes: "Защитите новый кузов до первых сколов",
  },
  {
    content: "price_install_fullfilm",
    eyebrow: "ФИКСИРОВАННАЯ ЦЕНА · OHTAAWA",
    leadIncludes: "в одном пакете за 180 000 ₽",
  },
];

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.OHTAAWA_CHROME_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const results = [];

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    for (const item of cases) {
      const url = new URL(baseUrl);
      url.searchParams.set("utm_source", "codex");
      url.searchParams.set("utm_medium", "qa");
      url.searchParams.set("utm_campaign", "wave45_message_match");
      url.searchParams.set("utm_content", item.content);
      url.searchParams.set("scenario", "full-film");
      url.searchParams.set("experiment_id", "wave45_owner_qa");

      await page.goto(url.toString(), { waitUntil: "domcontentloaded" });
      const actual = {
        eyebrow: (await page.locator("[data-hero-eyebrow-copy]").textContent()).trim(),
        lead: (await page.locator("[data-hero-lead]").textContent()).trim(),
      };
      results.push({
        content: item.content,
        pass:
          actual.eyebrow === item.eyebrow &&
          actual.lead.includes(item.leadIncludes),
      });
    }
  } finally {
    await browser.close();
  }

  const report = {
    pass: results.every((item) => item.pass),
    cases: results,
  };
  process.stdout.write(`${JSON.stringify(report)}\n`);
  if (!report.pass) process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
