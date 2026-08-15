const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const controlPath = path.join(root, "index.html");
const candidatePath = path.join(root, "question-first", "index.html");
const control = fs.readFileSync(controlPath, "utf8").replaceAll("\r\n", "\n");
const candidate = fs.readFileSync(candidatePath, "utf8").replaceAll("\r\n", "\n");

const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const tags = (value) => [...value.matchAll(/<\/?([a-z][\w-]*)\b/gi)].map((match) => match[1].toLowerCase());
const localAssets = (value) =>
  [...value.matchAll(/(?:src|srcset|data-src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((item) => /^(?:\.\.\/)?assets\//.test(item))
    .map((item) => item.replace(/^\.\.\//, "").replace(/\?.*$/, ""));
const visibleText = (value) =>
  value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .split("\n")
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);

const controlTags = tags(control);
const candidateTags = tags(candidate);
const controlAssets = localAssets(control);
const candidateAssets = localAssets(candidate);
const controlText = visibleText(control);
const candidateText = visibleText(candidate);

const textDiffs = [];
for (let index = 0; index < Math.max(controlText.length, candidateText.length); index += 1) {
  if (controlText[index] !== candidateText[index]) {
    textDiffs.push({ index, control: controlText[index], candidate: candidateText[index] });
  }
}

const allowedTextDiffs = [
  ["Записаться", "Задать вопрос"],
  ["Записаться на консультацию", "Задать вопрос по автомобилю"],
  [
    "Детейлинг-мойка кузова во время консультации — за наш счет.",
    "Если после ответа решите приехать на консультацию, детейлинг-мойка кузова — за наш счет.",
  ],
  [
    "Весь визит займет около полутора часов: чистый автомобиль проще осмотреть и спокойно обсудить детали.",
    "Консультация займет около полутора часов: чистый автомобиль проще осмотреть и спокойно обсудить детали.",
  ],
  ["Записаться на консультацию", "Задать вопрос по автомобилю"],
  ["Обсудить удобную дату", "Задать вопрос по автомобилю"],
  [
    "Запишитесь на консультацию. Вымоем кузов за наш счет, осмотрим автомобиль и ответим на вопросы.",
    "Начните с вопроса по своему автомобилю. Администратор уточнит сроки работ и ближайшие даты.",
  ],
  ["Записаться на консультацию", "Задать вопрос по автомобилю"],
  ["Записаться на консультацию", "Задать вопрос по автомобилю"],
  [
    "Сообщите марку и модель автомобиля. Администратор предложит ближайшее удобное время.",
    "Напишите марку и модель. Администратор уточнит сроки работ и ближайшие даты.",
  ],
].map(([controlValue, candidateValue]) => ({ control: controlValue, candidate: candidateValue }));

const normalizeDiffs = (diffs) => diffs.map(({ control: controlValue, candidate: candidateValue }) => ({
  control: controlValue,
  candidate: candidateValue,
}));

const preparedMessageControl =
  "Добрый день! Хочу записаться на консультацию по полной защитной оклейке кузова за 180 000 ₽. Автомобиль: [марка и модель]. Подскажите ближайшее время.";
const preparedMessageCandidate =
  "Добрый день! Рассматриваю полную защитную оклейку кузова за 180 000 ₽. Автомобиль: [марка и модель]. Подскажите, пожалуйста, сроки работ и ближайшие даты.";

const result = {
  pass: true,
  controlSha256: hash(control),
  candidateSha256: hash(candidate),
  checks: {
    tagSequenceIdentical: JSON.stringify(controlTags) === JSON.stringify(candidateTags),
    localAssetSequenceIdentical: JSON.stringify(controlAssets) === JSON.stringify(candidateAssets),
    textDiffsAllowed: JSON.stringify(normalizeDiffs(textDiffs)) === JSON.stringify(allowedTextDiffs),
    intentCtaCount: (candidate.match(/data-track-event="contact_intent_open_question_first_v1"/g) || []).length,
    preparedMessageControlCount: (control.match(new RegExp(preparedMessageControl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length,
    preparedMessageCandidateCount: (candidate.match(new RegExp(preparedMessageCandidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length,
    controlExperimentPreserved: control.includes('"experimentId":"wave45_control"'),
    candidateExperimentIsolated: candidate.includes('"experimentId":"wave50_question_first"'),
    candidateVersionIsolated: candidate.includes('"landingVersion":"wave50-question-first"'),
    candidateRouteIsolated: candidate.includes('https://go.detailingspb.ru/question-first/'),
    offerPreserved: candidate.includes('"offerId":"full_film_fixed_180"'),
    counterPreserved: candidate.includes('"metrikaCounter":110584673'),
    directHeroChannels: (candidate.match(/<section class="hero"[\s\S]*?<\/section>/)?.[0].match(/data-channel=/g) || []).length,
  },
  textDiffs,
};

result.pass =
  result.checks.tagSequenceIdentical &&
  result.checks.localAssetSequenceIdentical &&
  result.checks.textDiffsAllowed &&
  result.checks.intentCtaCount === 5 &&
  result.checks.preparedMessageControlCount === 3 &&
  result.checks.preparedMessageCandidateCount === 3 &&
  result.checks.controlExperimentPreserved &&
  result.checks.candidateExperimentIsolated &&
  result.checks.candidateVersionIsolated &&
  result.checks.candidateRouteIsolated &&
  result.checks.offerPreserved &&
  result.checks.counterPreserved &&
  result.checks.directHeroChannels === 0;

console.log(JSON.stringify(result, null, 2));
if (!result.pass) process.exitCode = 1;
