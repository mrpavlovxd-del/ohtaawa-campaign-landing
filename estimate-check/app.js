(() => {
  const COUNTER_ID = 110584673;
  const EXPERIMENT_ID = "estimate_audit_w34";
  const SCENARIO = "quote_second_opinion";
  const CHANNEL_CODE = "EST_W34";
  const params = new URLSearchParams(window.location.search);
  const qaSources = new Set(["qa", "codex", "smoke"]);
  const isQa = params.has("_ym_debug") || params.has("qa_marker") || qaSources.has((params.get("utm_source") || "").toLowerCase());

  const context = {
    experiment_id: EXPERIMENT_ID,
    scenario: SCENARIO,
    channel_code: CHANNEL_CODE,
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "unconventional_quote_audit_2026w34",
    utm_content: params.get("utm_content") || "",
    partner_code: params.get("partner_code") || ""
  };

  window.dataLayer = window.dataLayer || [];

  function track(name, extra = {}) {
    const payload = { event: name, event_name: name, ...context, ...extra };
    window.dataLayer.push(payload);
    if (!isQa && typeof window.ym === "function") {
      window.ym(COUNTER_ID, "reachGoal", name, payload);
    }
    return payload;
  }

  if (!isQa && location.hostname === "go.detailingspb.ru") {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://mc.yandex.ru/metrika/tag.js?id=${COUNTER_ID}`;
    document.head.appendChild(script);
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    window.ym(COUNTER_ID, "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true
    });
    window.ym(COUNTER_ID, "params", context);
  }

  const questions = {
    scope: "Какие именно окрашенные элементы кузова входят в стоимость?",
    material: "Какой тип пленки используется и какие ее характеристики указаны?",
    prep: "Какая мойка, очистка и подготовка поверхности входят в работу?",
    edges: "Где пленка подворачивается и какие элементы снимаются при монтаже?",
    control: "Как проверяют поверхность, прилегание и кромки после монтажа?",
    warranty: "На что именно распространяется гарантия и при каких условиях?"
  };

  const form = document.querySelector("#audit-form");
  const index = document.querySelector("#result-index");
  const title = document.querySelector("#result-title");
  const summary = document.querySelector("#result-summary");
  const list = document.querySelector("#result-questions");
  const action = document.querySelector("#result-action");
  const telegramCtas = [document.querySelector("#telegram-cta"), document.querySelector("#final-telegram-cta")].filter(Boolean);
  let started = false;
  let latest = { service: "Зоны риска", count: 0, missing: Object.keys(questions) };

  form.addEventListener("change", () => {
    if (!started) {
      started = true;
      track("estimate_audit_started_v1", { location: "checklist" });
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const checked = data.getAll("scope");
    const missing = Object.keys(questions).filter(key => !checked.includes(key));
    const service = data.get("service") || "Не выбрано";
    latest = { service, count: checked.length, missing };

    index.textContent = `${String(checked.length).padStart(2, "0")} / 06`;
    if (checked.length <= 2) {
      title.textContent = "В смете пока слишком много неизвестного";
      summary.textContent = "До оплаты стоит письменно уточнить состав. Начните с этих вопросов:";
    } else if (checked.length <= 4) {
      title.textContent = "Основа есть, но важные детали еще открыты";
      summary.textContent = "Предложение уже можно сравнивать, если закрыть оставшиеся вопросы:";
    } else if (checked.length === 5) {
      title.textContent = "Смета выглядит подробно";
      summary.textContent = "Остался один пункт, который лучше подтвердить до оплаты:";
    } else {
      title.textContent = "Состав описан подробно";
      summary.textContent = "Теперь стоит проверить, одинаково ли вы и студия понимаете результат и условия:";
    }

    const output = missing.length
      ? missing.map(key => questions[key])
      : [
          "Есть ли исключения из указанной стоимости для вашей модели?",
          "Когда можно осмотреть автомобиль и подтвердить финальный состав?",
          "Как будут зафиксированы согласованные условия перед началом работ?"
        ];
    list.replaceChildren(...output.map(text => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    }));
    action.hidden = false;
    track("estimate_audit_result_v1", {
      location: "result",
      service,
      specified_count: checked.length,
      missing_count: missing.length
    });
    document.querySelector("#audit-result").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  telegramCtas.forEach((link) => {
    link.addEventListener("click", async () => {
      const message = [
        "Добрый день! Хочу получить второе мнение по смете на оклейку.",
        `Услуга: ${latest.service}.`,
        `В смете явно указано ${latest.count} из 6 ключевых пунктов.`,
        `Код обращения: ${CHANNEL_CODE}.`,
        "Прикладываю обезличенное предложение."
      ].join(" ");
      try { await navigator.clipboard.writeText(message); } catch (_) { /* Messenger still opens. */ }
      track("lead_telegram_estimate_audit_v1", {
        location: link.id === "telegram-cta" ? "audit_result" : "final",
        destination: "telegram",
        service: latest.service,
        specified_count: latest.count
      });
      track("lead_telegram_polish_film_v8", {
        location: "estimate_audit",
        destination: "telegram",
        service: latest.service
      });
    });
  });

  document.querySelectorAll("[data-event]").forEach(element => {
    element.addEventListener("click", () => track(element.dataset.event, { location: "hero" }));
  });

  window.__OHTAAWA_ESTIMATE_AUDIT__ = { context, track, isQa };
})();
