# Wave46: журнал существенных находок

| ID | Источник | Важность | Находка | Действие | Статус | Проверка |
|---|---|---:|---|---|---|---|
| W46-001 | Mobile visual QA | High | Фиксированный CTA мог бы перекрывать контент и интерфейс браузера | На странице Wave46 фиксированный нижний CTA не используется | Closed | Visual QA: 0 bottom fixed obstructions |
| W46-002 | Asset review | High | Первоначальный кадр состава пакета выглядел слабее hero и снижал премиальность | Создан и внедрен отдельный крупный план передней части автомобиля | Closed | Desktop/mobile package screenshots |
| W46-003 | Analytics review | High | Общий счетчик старой страницы смешивал бы поведение разных доменов и маршрутов | Использован go-only счетчик 110584673 и отдельный service route | Closed | Tracking QA: counter, route, offer and experiment match |
| W46-004 | Campaign validator | Medium | Второй заголовок группы нового автомобиля превышал лимит Яндекса | Заголовок сокращен до допустимой длины, XLSX пересобран | Closed | Validator: 0 warnings, 17 rows |
| W46-005 | Proof governance | Medium | Атмосферные изображения нельзя использовать как фактическое доказательство выполненной работы | Hero и package image отделены от реальной proof-карусели, provenance сохранен | Accepted boundary | Asset manifest and page IA |
| W46-006 | Legal layer | Medium | Полная документальная система гарантии пока не разработана | На странице только базовая гарантия 5 лет и уточнение условий у администратора; отдельный legal workstream отложен до первых лидов | Deferred by owner | Landing disclaimer and project decision |
| W46-007 | Launch gate | High | Публикация страницы и включение рекламы до owner review смешали бы гипотезы и создали риск расхода | Кандидат и импорт остаются локальными/выключенными | Open | Owner decision required |
