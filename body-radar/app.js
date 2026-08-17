(() => {
  const COUNTER_ID = 110584673;
  const EXPERIMENT_ID = "body_risk_radar_w34";
  const SCENARIO = "vehicle_risk_signal_optin";
  const CHANNEL_CODE = "BRR_W34";
  const params = new URLSearchParams(window.location.search);
  const qaSources = new Set(["qa", "codex", "smoke"]);
  const isQa = params.has("_ym_debug") || params.has("qa_marker") || qaSources.has((params.get("utm_source") || "").toLowerCase());

  const context = {
    experiment_id: EXPERIMENT_ID,
    scenario: SCENARIO,
    channel_code: CHANNEL_CODE,
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "unconventional_body_risk_radar_2026w34",
    utm_content: params.get("utm_content") || "",
    entry_signal: params.get("entry_signal") || ""
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

  track("body_radar_view_v1", { location: "route" });

  document.querySelectorAll("[data-radar-subscribe]").forEach((link) => {
    link.addEventListener("click", () => {
      track("body_radar_subscribe_click_v1", {
        location: link.dataset.location || "unknown",
        destination: "telegram_channel"
      });
    });
  });

  document.querySelectorAll("[data-how-link]").forEach((link) => {
    link.addEventListener("click", () => track("body_radar_how_it_works_v1", { location: "hero" }));
  });

  document.querySelectorAll("[data-source-link]").forEach((link) => {
    link.addEventListener("click", () => {
      track("body_radar_source_click_v1", {
        location: "source",
        official_source: link.dataset.source || "unknown"
      });
    });
  });

  document.querySelectorAll("[data-inspection-cta]").forEach((link) => {
    link.addEventListener("click", async () => {
      const signal = context.entry_signal ? ` Событие: ${context.entry_signal}.` : "";
      const message = `Добрый день! Хочу проверить кузов после погодного или дорожного события.${signal} Автомобиль: [марка и модель]. Код обращения: ${CHANNEL_CODE}.`;
      try { await navigator.clipboard.writeText(message); } catch (_) { /* Messenger still opens. */ }
      track("lead_telegram_body_radar_v1", {
        location: "inspection",
        destination: "telegram",
        entry_signal: context.entry_signal
      });
      track("lead_telegram_polish_film_v8", {
        location: "body_radar",
        destination: "telegram",
        entry_signal: context.entry_signal
      });
    });
  });

  window.__OHTAAWA_BODY_RADAR__ = { context, track, isQa };
})();
