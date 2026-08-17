# Задача Qwen 3.7 Max: самостоятельно собрать новый сайт OHTAAWA

## Итог, который требуется

Ты — самостоятельный design director, information architect и implementation lead. Не ограничивайся аудитом, описанием или wireframe. **Полностью собери в этом worktree новый работающий вариант главной посадочной `/` для полной прозрачной оклейки OHTAAWA за 180 000 ₽**: собственная IA, дизайн, типографика, responsive layout, code-native custom icons/graphics, purposeful motion и сильная визуальная драматургия. Владелец прямо просит твое собственное видение, а не адаптацию текущего дизайна.

Рабочая папка: текущий workspace. Ветка уже изолирована и помечена NOT FOR DEPLOY.

## Перед кодом

1. Полностью прочитай:
   - `docs/qwen-full-film-experiment/PRODUCT_STUDIO_RUN_MANIFEST_RU.md`;
   - `docs/qwen-full-film-experiment/SOURCE_OF_TRUTH_RU.md`;
   - `assets/provenance-wave45.json`.
2. Изучи только брендовые логотипы и inventory медиа. Текущие `index.html` и `assets/styles.css` можно использовать для проверки контактов/events, но **запрещено наследовать их layout skeleton, порядок секций, card patterns, copy rhythm или visual language**.
3. Сформируй четыре materially different направления. Сравни Product, UX/CRO, Technical, Risk, Speed/Cost, Maintainability. Выбери одно сам и зафиксируй решение в `docs/qwen-full-film-experiment/QWEN_DESIGN_DECISION_RU.md`.
4. Проведи Library Selection Board до добавления зависимости. Предпочти минимальный локальный stack; WebGL/GSAP/Rive/Three допускаются только если signature experience невозможно честно и качественно реализовать легче. Не использовать CDN в production source.
5. Создай motion purpose map и reduced-motion/state contract в `docs/qwen-full-film-experiment/QWEN_MOTION_CONTRACT_RU.md`.

## Амбиция и свобода

- Сделай радикальный отход от типичной OHTAAWA/Codex архитектуры. Не строй обычную последовательность `hero → trust cards → grid → FAQ → footer`.
- Разрешены смелая типографика, нестандартный spatial rhythm, layered composition, scrollytelling без scroll-jacking, кинетический текст, responsive mask/reveal, video/canvas/procedural background, собственная система пиктограмм и одна сильная signature interaction.
- Motion обязан объяснять продукт: прозрачная оболочка, натяжение пленки, фиксация кромки, контроль света, полный контур защиты. Не анимируй все элементы ради демонстрации.
- Цена `180 000 ₽`, предмет услуги, срок `3–5 дней` и первый конкретный шаг должны быть видны сразу и не ждать loader/video/animation.
- Первый шаг должен быть психологически легче абстрактной «консультации»: короткий вопрос или уточнение ближайшего времени с заранее подготовленным сообщением, без обещания недоказанного SLA.
- Сделай страницу узнаваемой как продукт OHTAAWA, а не generic neon/carbon supercar template.

## Видео и media

- В репозитории нет подтвержденного реального фонового видео. Не симулируй клиентское видео и не выдавай generated loop за proof.
- Если создаешь видео/loop сам, он должен быть абстрактным или явно illustrative, без клиента/мастерской/результата, иметь локальный poster и mobile/reduced-data fallback, provenance entry и статус `candidate_not_published`.
- Если честный video background нельзя сделать owner-grade в доступных инструментах, создай сильную procedural/code-native motion-сцену вместо слабого псевдовидео и точно зафиксируй video asset gap.
- Реальные изображения из `assets/proof/real/**` можно использовать только как proof с корректными подписями. Generated/atmosphere assets — только как иллюстрацию, не доказательство.
- Не создавай weak placeholder, fake review, fake logo wall или stock substitution.

## Что изменить в source

- Замени `index.html` на собственную архитектуру главной посадочной.
- Создай новый, изолированный CSS/JS (например `assets/qwen-full-film.css` и `assets/qwen-full-film.js`); не переписывай route-specific файлы `/risk-zones/` и `/color-film/`.
- Сохрани favicon и логотипы OHTAAWA.
- Сделай custom icons/illustrations code-native и accessible. SVG должен быть осмысленным, не набором generic line icons.
- Сохрани реальные контактные ссылки и канонические event names/counter/QA-isolation из Source of Truth.
- Сохрани UTM/query parameters при переходах, где это уже делает текущая аналитика.
- Не добавляй fake форма/CRM endpoint. Контактные действия ведут в реальные канонические phone/TG/WA/MAX пути через доступный chooser или ясные direct actions.
- Не трогай остальные production routes и не вноси никаких live изменений.

## Обязательный proof твоей сборки

1. Сам запусти локальный preview и проверь desktop/mobile минимум `1440`, `430`, `390`, `360`.
2. Создай fresh screenshots в `artifacts/qwen-full-film-qa/`; не используй старые скриншоты как новый proof.
3. Проверь: horizontal overflow, broken images/video/poster, console errors, failed network, keyboard/focus, skip link, dialog semantics, `prefers-reduced-motion`, `Save-Data`/mobile fallback, CTA links, event map и QA-isolation.
4. Измерь initial transfer / image-video weights и доступные Web Vitals/Lighthouse. Цели: LCP ≤ 2,5 с на реалистичном mobile profile, CLS < 0,1, INP < 200 мс; если цель не доказана, не выдумывай PASS.
5. Обнови `docs/qwen-full-film-experiment/FOUND_ISSUES_LEDGER_RU.md` и создай `QWEN_QA_REPORT_RU.md` с фактами, гипотезами, закрытыми/отложенными проблемами и launch boundary.
6. Проведи self-red-team. Если результат выглядит как generic AI luxury landing, старый OHTAAWA с другим CSS или motion-showreel без CRO, отклони его и сделай еще одну внутреннюю итерацию.

## Жесткие границы

- Не commit, push, PR, merge, deploy, DNS или production changes.
- Не открывать и не менять рекламные кабинеты, бюджеты, кампании, Mango, Метрику/goals и live UTM.
- Не устанавливать глобальные зависимости и не менять Codex/Qwen config.
- Не читать и не выводить secret values. Не писать приватные ссылки/токены в отчеты.
- Не выдумывать данные за пределами `SOURCE_OF_TRUTH_RU.md`.
- Не считать redesign доказанно повышающим конверсию до отдельного чистого эксперимента.

## Финальный ответ Qwen

После реальной сборки кратко сообщи: выбранное видение; фактически измененные файлы; выполненные проверки и пути proof; известные риски/непроверенное; почему это действительно новая архитектура; что требует owner approval. Если сайт не собран, вердикт должен быть `INCOMPLETE`, а не концептуальный PASS.
