# VK Pixel 3639916: контракт интеграции

Статус: **NO-GO для публикации**.

## Почему NO-GO

В текущем `index.html` нет consent/privacy gate и ссылки на политику обработки персональных данных. Ретаргетинговый пиксель нельзя честно включать до явного согласия пользователя и утвержденного процесса отзыва согласия. Подготовленный код поэтому работает по принципу default deny: до consent-сигнала не создается `_tmr`, не загружается `top-fwz1.mail.ru/js/code.js` и не ставится `noscript`-пиксель.

## Контракт активации

Consent-система должна до или после загрузки страницы:

```js
window.ohtaawaAnalyticsConsent = true;
document.dispatchEvent(new CustomEvent("ohtaawa:analytics-consent", {
  detail: { analytics: true }
}));
```

Отказ или отзыв передается тем же событием с `analytics: false`. Это останавливает новые вызовы VK Pixel, но само по себе не удаляет уже созданные сторонним счетчиком идентификаторы. До утверждения политики, хранения доказательства согласия и процедуры удаления/отзыва публикация остается заблокированной.

## Минимизация данных

- Page view: только pixel ID `3639916`, canonical URL `https://go.detailingspb.ru/`, пустой referrer и timestamp.
- Не передаются `userid`, телефон, email, имя, raw query/UTM, `location`, `destination`, `experiment_id`, clipboard/WhatsApp message или произвольные `params`.
- События разрешены только по allowlist и отправляются не более одного раза за загрузку страницы.

| Существующее событие страницы | VK goal |
|---|---|
| `lead_phone_polish_film_v8` | `ctaPhone` |
| `lead_telegram_polish_film_v8` | `ctaTelegram` |
| `lead_whatsapp_polish_film_v8` | `ctaWhatsapp` |
| `lead_max_direct_polish_film_v8` | `ctaMax` |
| `price_view_polish_film_v9` | `priceView` |
| `proof_view_polish_film_v9` | `proofView` |

Счетчик Метрики `110584673` и переходный legacy-счетчик не меняются этой веткой.

## Release gate

До merge/deploy необходимы: юридически утвержденная policy/consent формулировка, доступная ссылка на нее, доказуемый opt-in и отзыв, решение по уже существующей Метрике, review Draft PR и отдельное разрешение владельца на публикацию. Кабинеты, DNS, кампании и live events не входят в эту работу.

## Технические источники

- Top.Mail.Ru JS API: https://top.mail.ru/help/ru/api/jsapi
- Top.Mail.Ru AJAX/pageView URL override: https://top.mail.ru/help/ru/code/ajax
- Top.Mail.Ru goals: https://top.mail.ru/help/ru/settings/goals
- 152-ФЗ, статьи 6, 9, 15 и 18.1: https://www.consultant.ru/document/cons_doc_LAW_61801/
