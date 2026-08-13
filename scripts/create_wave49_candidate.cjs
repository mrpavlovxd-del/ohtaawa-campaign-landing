const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "index.html");
const targetDir = path.join(root, "contact-first");
const target = path.join(targetDir, "index.html");

let html = fs.readFileSync(source, "utf8");

const oldHero = /          <div class="hero-actions">[\s\S]*?<\/div>\r?\n\r?\n          <p class="hero-consultation">/;

const contactMessage =
  "Добрый день! Хочу уточнить ближайшее время по полной защитной оклейке кузова за 180 000 ₽. Автомобиль: [марка и модель].";

const newHero = `          <div class="contact-console" aria-labelledby="hero-contact-title">
            <div class="contact-console-copy">
              <span>Подберем удобное время</span>
              <h2 id="hero-contact-title">Узнать ближайшее окно</h2>
              <p>Напишите марку и модель автомобиля. Администратор уточнит детали и предложит удобное время.</p>
            </div>
            <div class="hero-contact-list" aria-label="Выберите удобный способ связи">
              <a href="https://t.me/ohtaawa_chat" target="_blank" rel="noopener" data-channel="telegram" data-contact-location="hero_direct" data-copy-message="${contactMessage}"><span class="contact-icon" aria-hidden="true">TG</span><strong>Telegram</strong><i aria-hidden="true">↗</i></a>
              <a href="https://wa.me/79910102020" target="_blank" rel="noopener" data-channel="whatsapp" data-contact-location="hero_direct" data-copy-message="${contactMessage}"><span class="contact-icon" aria-hidden="true">WA</span><strong>WhatsApp</strong><i aria-hidden="true">↗</i></a>
              <a href="https://max.ru/u/f9LHodD0cOI5wt5WT7UlPEsbpi4oIsz6xG3oS67WnEdrB3Btf3BZUshskUk" target="_blank" rel="noopener" data-channel="max" data-contact-location="hero_direct" data-copy-message="${contactMessage}"><span class="contact-icon" aria-hidden="true">M</span><strong>MAX</strong><i aria-hidden="true">↗</i></a>
              <a href="tel:+78127678840" data-channel="phone" data-contact-location="hero_direct"><span class="contact-icon" aria-hidden="true">☎</span><strong>Позвонить</strong><i aria-hidden="true">↗</i></a>
            </div>
          </div>
          <a class="quiet-action hero-scope-link" href="#scope">Посмотреть состав работ <span aria-hidden="true">↓</span></a>`;

if (!oldHero.test(html)) throw new Error("Wave45 hero action block not found");
html = html.replace(oldHero, `${newHero}\n\n          <p class="hero-consultation">`);
html = html.replace(
  '<link rel="stylesheet" href="assets/styles.css?v=wave45-20260808b">',
  '<link rel="stylesheet" href="../assets/styles.css?v=wave45-20260808b">\n  <link rel="stylesheet" href="../assets/contact-first.css?v=wave49-20260813a">',
);
html = html.replaceAll('src="assets/', 'src="../assets/');
html = html.replaceAll('href="assets/', 'href="../assets/');
html = html.replaceAll('srcset="assets/', 'srcset="../assets/');
html = html.replaceAll('content="https://go.detailingspb.ru/assets/', 'content="https://go.detailingspb.ru/assets/');
html = html.replace(
  '<meta property="og:url" content="https://go.detailingspb.ru/">',
  '<meta property="og:url" content="https://go.detailingspb.ru/contact-first/">',
);
html = html.replace(
  '"landingVersion":"wave45-proof-first"',
  '"landingVersion":"wave49-contact-first"',
);
html = html.replace('"experimentId":"wave45_control"', '"experimentId":"wave49_contact_first"');
html = html.replace(
  '<script src="assets/app.js?v=wave45-20260808b"></script>',
  '<script src="../assets/app.js?v=wave49-20260813a"></script>',
);
html = html.replace(
  '>Записаться</button>',
  '>Узнать окно</button>',
);
html = html.replaceAll(
  'Записаться на консультацию <span class="action-arrow"',
  'Узнать ближайшее окно <span class="action-arrow"',
);
html = html.replace(
  '<h2 id="contact-title">Записаться на консультацию</h2>',
  '<h2 id="contact-title">Узнать ближайшее окно</h2>',
);
html = html.replace(
  'Запишитесь на консультацию. Вымоем кузов за наш счет, осмотрим автомобиль и ответим на вопросы.',
  'Уточните ближайшее окно. Вымоем кузов за наш счет, осмотрим автомобиль и спокойно ответим на вопросы.',
);
html = html.replaceAll(
  'Хочу записаться на консультацию по полной защитной оклейке кузова за 180 000 ₽.',
  'Хочу уточнить ближайшее время по полной защитной оклейке кузова за 180 000 ₽.',
);

fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(target, html);
process.stdout.write(`${target}\n`);
