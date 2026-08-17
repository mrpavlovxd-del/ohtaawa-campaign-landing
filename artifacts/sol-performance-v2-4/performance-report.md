# SOL Performance v2.4

**Итог: PASS.** Выполнено 5 холодных мобильных прогонов 390×844 и 1 холодный десктопный прогон 1440×1000.

## Ключевые результаты

Значения для mobile: минимум / медиана / максимум.

| Метрика | Mobile min / median / max | Бюджет | Итог |
|---|---:|---:|---|
| FCP | 1332 мс / 1344 мс / 1352 мс | ≤ 1800 мс | PASS |
| LCP | 1332 мс / 1344 мс / 1352 мс | ≤ 2500 мс | PASS |
| CLS | 0 / 0 / 0 | target ≤ 0.05; max ≤ 0.1 | PASS |
| TBT proxy* | 0 мс / 0 мс / 0 мс | ≤ 200 мс | PASS |
| Initial transfer | 315 КиБ / 315 КиБ / 315 КиБ | ≤ 350 КиБ | PASS |
| Full after proof | 534.6 КиБ / 534.6 КиБ / 534.6 КиБ | ≤ 1 МиБ | PASS |
| Secondary proof WebP до scroll | 0 / 0 / 0 | 0 файлов | PASS |
| Retained proof WebP не загружены после traversal | 0 / 0 / 0 | 0 файлов | PASS |

Desktop (1 прогон): FCP 1448 мс, LCP 1492 мс, CLS 0, TBT proxy 0 мс, initial 331.7 КиБ, full 551.4 КиБ. Агрегатный результат: PASS.

Proof resource hard gate: PASS.

## Проверено

- HTTP-кэш очищался и отключался через CDP перед каждым прогоном; origin storage очищался, service worker обходился.
- Через CDP эмулировались 150 мс latency, 1,6 Мбит/с download, 750 Кбит/с upload, cellular4g и CPU ×4.
- PerformanceObserver устанавливался до навигации для FCP/LCP/CLS/longtask.
- Initial transfer посчитан до взаимодействия. Затем скрипт прокрутил proof, переключил и декодировал все кадры, прошёл всю страницу шагами и декодировал все изображения; после этого посчитан full transfer.
- В JSON сохранены initial resource filenames по каждому прогону; secondary proof WebP до scroll и отсутствующие retained proof WebP после traversal являются hard failures.
- Дополнительно сохранён независимый CDP encodedDataLength ledger по каждому запросу. Ошибок console/page: 0.

## Ограничения и риски

- *TBT proxy — сумма блокирующих частей longtask после FCP до первичного среза. Это **не Lighthouse TBT**: Lighthouse/TTI/trace-модель не запускались.
- LCP — последний кандидат, замеченный observer до первой программной прокрутки; это лабораторный, а не полевой CrUX-показатель.
- Transfer Size взят из Navigation/Resource Timing; CDP encodedDataLength сохранён отдельно и может отличаться из-за учёта заголовков/протокола.
- Недоступные observer-типы: нет.
- Непройденных assertions: 0.

Полные данные и ресурсные записи: `artifacts/sol-performance-v2-4/performance-report.json`. Скрипт: `scripts/sol_perf_v2_2.cjs`.
