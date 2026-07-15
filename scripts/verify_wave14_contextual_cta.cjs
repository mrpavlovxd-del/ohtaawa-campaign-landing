const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");

const checks = [
  ["price CTA section", /class="price-contact"/],
  ["price CTA title slot", /data-scenario-slot="price-contact-title"/],
  ["price CTA note slot", /data-scenario-slot="price-contact-note"/],
  ["used-car photo estimate", /Пришлите 2-3 фото при дневном свете/],
  ["new-car model protection", /Подскажем зоны риска, варианты пленки/],
  ["CRM next step", /Начните с короткой консультации/],
  ["Telegram price CTA", /lead_telegram_polish_film_v8" data-ohtaawa-location="price_context"/],
  ["WhatsApp price CTA", /lead_whatsapp_polish_film_v8" data-ohtaawa-location="price_context"/],
  ["MAX price CTA", /lead_max_direct_polish_film_v8" data-ohtaawa-location="price_context"/],
  ["phone price CTA", /lead_phone_polish_film_v8" data-ohtaawa-location="price_context"/],
  ["scenario slot application", /\["price-contact-title", variant\.priceContactTitle\]/],
];

const failures = checks.filter(([, pattern]) => !pattern.test(html)).map(([name]) => name);
const result = {
  status: failures.length ? "FAIL" : "PASS",
  checks: checks.length,
  failures,
};

console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
