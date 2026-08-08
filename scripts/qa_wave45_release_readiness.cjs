const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const projectRoot = path.resolve(repoRoot, "..", "..");
const reportDir =
  process.env.OHTAAWA_QA_REPORT_DIR ||
  path.join(
    projectRoot,
    "docs",
    "ohtaawa-retargeting",
    "agent-work",
    "2026-08-08",
    "landing-wave45-final-qa",
  );
const previewUrl =
  process.env.OHTAAWA_QA_URL ||
  "http://127.0.0.1:4185/?utm_source=codex&utm_medium=qa&utm_campaign=wave45_release_readiness&scenario=full-film&experiment_id=wave45_owner_qa";
const productionUrl = "https://go.detailingspb.ru/";

function runJson(script) {
  const result = spawnSync(process.execPath, [path.join(__dirname, script)], {
    cwd: repoRoot,
    env: { ...process.env, OHTAAWA_QA_URL: previewUrl },
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return {
      pass: false,
      error: (result.stderr || result.stdout || `exit ${result.status}`).trim(),
    };
  }
  try {
    return JSON.parse(result.stdout);
  } catch {
    return { pass: false, error: "QA script returned non-JSON output" };
  }
}

async function status(url) {
  try {
    const response = await fetch(url, { redirect: "follow" });
    return { ok: response.ok, status: response.status, finalUrl: response.url };
  } catch (error) {
    return { ok: false, status: null, error: error.message };
  }
}

function includesAll(text, values) {
  return values.every((value) => text.includes(value));
}

async function main() {
  const html = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(repoRoot, "assets", "app.js"), "utf8");
  const provenancePath = path.join(repoRoot, "assets", "provenance-wave45.json");
  const visualReportPath = path.join(reportDir, "visual-qa.json");

  const [preview, production] = await Promise.all([
    status(previewUrl),
    status(productionUrl),
  ]);
  const tracking = runJson("qa_wave45_tracking.cjs");
  const visual = fs.existsSync(visualReportPath)
    ? JSON.parse(fs.readFileSync(visualReportPath, "utf8"))
    : { pass: false, error: "visual-qa.json not found" };

  const sourceChecks = {
    dedicatedCounter:
      html.includes('data-ohtaawa-metrica-counter-ids="110584673"') &&
      html.includes('"metrikaCounter":110584673'),
    canonicalContactData: includesAll(html, [
      "+7 (812) 767-88-40",
      "https://t.me/ohtaawa_chat",
      "https://wa.me/79910102020",
      "https://max.ru/u/f9LHodD0cOI5wt5WT7UlPEsbpi4oIsz6xG3oS67WnEdrB3Btf3BZUshskUk",
      "улица Людмилы Кедриной, 21Г",
    ]),
    agreedOffer: includesAll(html, [
      "180 000 ₽",
      "3–5 дней",
      "5 лет",
      "Детейлинг-мойка кузова во время консультации — за наш счет",
      "При полной оклейке оплатим такси до дома",
    ]),
    legalDisclaimer: html.includes("не является публичной офертой"),
    canonicalGoals: includesAll(app, [
      "lead_phone_polish_film_v8",
      "lead_telegram_polish_film_v8",
      "lead_whatsapp_polish_film_v8",
      "lead_max_direct_polish_film_v8",
      "landing_scroll_50_polish_film_v8",
      "landing_scroll_90_polish_film_v8",
    ]),
    qaIsolation: includesAll(app, ["_ym_debug", "codex", "smoke"]),
    provenanceManifest: fs.existsSync(provenancePath),
    forbiddenCopyAbsent: ![
      "запускное предложение",
      "проверьте, подходит ли ваш автомобиль",
      "при внесении предоплаты",
      "PPF",
    ].some((phrase) => html.toLowerCase().includes(phrase.toLowerCase())),
  };

  const sourcePass = Object.values(sourceChecks).every(Boolean);
  const visualPass =
    visual.pass === true ||
    (visual.desktop?.pass === true && visual.mobile?.pass === true);
  const readyForOwnerApproval =
    preview.ok &&
    production.ok &&
    tracking.pass === true &&
    visualPass &&
    sourcePass;

  const report = {
    checkedAt: new Date().toISOString(),
    status: readyForOwnerApproval
      ? "READY_FOR_OWNER_APPROVAL"
      : "NOT_READY_FOR_OWNER_APPROVAL",
    preview,
    productionBaseline: production,
    tracking,
    visual: {
      pass: visualPass,
      reportPath: visualReportPath,
      desktop: visual.desktop || null,
      mobile: visual.mobile || null,
    },
    sourceChecks,
    approvalBoundaries: {
      productionPublished: false,
      paidCampaignActivated: false,
      ownerApprovalRequired: true,
      urgencyVariantRequiresRealLaunchDeadline: true,
    },
  };

  fs.mkdirSync(reportDir, { recursive: true });
  const jsonPath = path.join(reportDir, "release-readiness.json");
  const mdPath = path.join(reportDir, "RELEASE_READINESS_RU.md");
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(
    mdPath,
    [
      "# Wave45: готовность к решению владельца",
      "",
      `Статус: **${report.status}**`,
      "",
      `- локальный кандидат: HTTP ${preview.status ?? "ошибка"};`,
      `- текущий production baseline: HTTP ${production.status ?? "ошибка"};`,
      `- tracking QA: ${tracking.pass ? "PASS" : "FAIL"};`,
      `- visual QA desktop/mobile: ${visualPass ? "PASS" : "FAIL"};`,
      `- source/offer/privacy checks: ${sourcePass ? "PASS" : "FAIL"}.`,
      "",
      "Production не изменён, платные кампании не активированы. Перед публикацией нужны просмотр владельца, выбор первой честной urgency-когорты и подтверждение команды «выкладывай».",
      "",
    ].join("\n"),
    "utf8",
  );

  process.stdout.write(`${JSON.stringify({ ...report, jsonPath, mdPath }, null, 2)}\n`);
  if (!readyForOwnerApproval) process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
