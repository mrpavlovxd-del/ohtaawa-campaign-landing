const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const baseUrl = process.env.OHTAAWA_QA_URL || "http://127.0.0.1:4186/risk-zones/";
const outputDir = process.env.OHTAAWA_QA_OUTPUT || path.resolve(
  __dirname,
  "../../../docs/ohtaawa-retargeting/agent-work/2026-08-09/landing-wave46-risk-zones-qa",
);

const variants = {
  newcar_riskzones: {
    eyebrow: "НОВЫЙ АВТОМОБИЛЬ · OHTAAWA",
    lead: "Защитите переднюю часть нового автомобиля до первых сколов. Прозрачная полиуретановая пленка и монтаж уже входят в фиксированную стоимость.",
  },
  riskzones_price: {
    eyebrow: "ФИКСИРОВАННАЯ ЦЕНА · OHTAAWA",
    lead: "Защита передней части автомобиля прозрачной полиуретановой пленкой: материал и монтаж в одном пакете за 60 000 ₽.",
  },
  front_protection_riskzones: {
    eyebrow: "ЗАЩИТА ПЕРЕДНЕЙ ЧАСТИ · OHTAAWA",
    lead: "Бампер, капот и уязвимые окрашенные элементы передней части получают защиту от сколов и следов ежедневной дороги.",
  },
};

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.OHTAAWA_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const results = {};
  try {
    for (const [content, expected] of Object.entries(variants)) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      const url = new URL(baseUrl);
      url.search = new URLSearchParams({
        utm_source: "codex",
        utm_medium: "qa",
        utm_campaign: "wave46_message_match",
        utm_content: content,
        scenario: "risk-zones",
        experiment_id: "wave46_owner_qa",
      }).toString();
      await page.goto(url.toString(), { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => Boolean(window.ohtaawaAnalytics));
      const actual = await page.evaluate(() => ({
        eyebrow: document.querySelector("[data-hero-eyebrow-copy]")?.textContent.trim(),
        lead: document.querySelector("[data-hero-lead]")?.textContent.trim(),
        whatsapp: document.querySelector('#contact-sheet [data-channel="whatsapp"]')?.href,
      }));
      results[content] = {
        pass: actual.eyebrow === expected.eyebrow && actual.lead === expected.lead &&
          actual.whatsapp.includes("text=") && decodeURIComponent(actual.whatsapp).includes("60 000 ₽"),
        expected,
        actual,
      };
      await page.close();
    }
  } finally {
    await browser.close();
  }
  const report = { pass: Object.values(results).every((result) => result.pass), results };
  fs.writeFileSync(path.join(outputDir, "message-match-qa.json"), `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.pass) process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
