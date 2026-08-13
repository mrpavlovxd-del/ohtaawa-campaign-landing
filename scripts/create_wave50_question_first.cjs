const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "index.html");
const outputDir = path.join(root, "question-first");
const outputPath = path.join(outputDir, "index.html");

let html = fs.readFileSync(sourcePath, "utf8").replaceAll("\r\n", "\n");

const replaceExact = (from, to, expectedCount = 1) => {
  const count = html.split(from).length - 1;
  if (count !== expectedCount) {
    throw new Error(`Expected ${expectedCount} occurrence(s), found ${count}: ${from}`);
  }
  html = html.split(from).join(to);
};

replaceExact(
  '<meta property="og:url" content="https://go.detailingspb.ru/">',
  '<meta property="og:url" content="https://go.detailingspb.ru/question-first/">',
);

html = html
  .replaceAll('href="assets/', 'href="../assets/')
  .replaceAll('src="assets/', 'src="../assets/')
  .replaceAll('srcset="assets/', 'srcset="../assets/')
  .replaceAll('data-src="assets/', 'data-src="../assets/');

const intentEvent = "contact_intent_open_question_first_v1";
let instrumentedCtas = 0;
html = html.replace(
  /data-open-contact data-contact-location="([^"]+)"/g,
  (_match, location) => {
    instrumentedCtas += 1;
    return `data-open-contact data-contact-location="${location}" data-track-event="${intentEvent}" data-track-location="${location}"`;
  },
);
if (instrumentedCtas !== 5) {
  throw new Error(`Expected 5 contact-intent CTAs, instrumented ${instrumentedCtas}`);
}

replaceExact(
  '>Записаться</button>',
  '>Задать вопрос</button>',
);
replaceExact(
  'Записаться на консультацию\n              <span class="action-arrow"',
  'Задать вопрос по автомобилю\n              <span class="action-arrow"',
);
replaceExact(
  '>Записаться на консультацию <span class="action-arrow"',
  '>Задать вопрос по автомобилю <span class="action-arrow"',
  2,
);
replaceExact(
  '>Обсудить удобную дату <span aria-hidden="true">→</span>',
  '>Задать вопрос по автомобилю <span aria-hidden="true">→</span>',
);
replaceExact(
  '<h2 id="contact-title">Записаться на консультацию</h2>',
  '<h2 id="contact-title">Задать вопрос по автомобилю</h2>',
);
replaceExact(
  '<p>Запишитесь на консультацию. Вымоем кузов за наш счет, осмотрим автомобиль и ответим на вопросы.</p>',
  '<p>Начните с вопроса по своему автомобилю. Администратор ответит по срокам и ближайшему времени.</p>',
);
replaceExact(
  '<p>Сообщите марку и модель автомобиля. Администратор предложит ближайшее удобное время.</p>',
  '<p>Напишите марку и модель. Администратор ответит по срокам, подготовке и ближайшему времени.</p>',
);
replaceExact(
  'Добрый день! Хочу записаться на консультацию по полной защитной оклейке кузова за 180 000 ₽. Автомобиль: [марка и модель]. Подскажите ближайшее время.',
  'Добрый день! Рассматриваю полную защитную оклейку кузова за 180 000 ₽. Автомобиль: [марка и модель]. Подскажите, пожалуйста, по срокам и ближайшему времени.',
  3,
);
replaceExact(
  '"landingVersion":"wave45-proof-first"',
  '"landingVersion":"wave50-question-first"',
);
replaceExact(
  '"experimentId":"wave45_control"',
  '"experimentId":"wave50_question_first"',
);
replaceExact(
  '<script src="../assets/app.js?v=wave45-20260808b"></script>',
  '<script src="../assets/app.js?v=wave50-question-first-20260814a"></script>',
);

if (html.includes('href="assets/') || html.includes('src="assets/') || html.includes('srcset="assets/')) {
  throw new Error("Question-first route still contains root-relative asset references");
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, html, "utf8");
console.log(`Created ${path.relative(root, outputPath)} with ${instrumentedCtas} intent CTAs`);
