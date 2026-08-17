(() => {
  const COUNTER_ID = 110584673;
  const EXPERIMENT_ID = "photo_triage_w34";
  const SCENARIO = "photo_defect_triage";
  const CHANNEL_CODE = "PHT_W34";
  const params = new URLSearchParams(window.location.search);
  const qaSources = new Set(["qa", "codex", "smoke"]);
  const isQa = params.has("_ym_debug") || params.has("qa_marker") || qaSources.has((params.get("utm_source") || "").toLowerCase());

  const context = {
    experiment_id: EXPERIMENT_ID,
    scenario: SCENARIO,
    channel_code: CHANNEL_CODE,
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "unconventional_photo_triage_2026w34",
    utm_content: params.get("utm_content") || "",
    partner_code: params.get("partner_code") || "",
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

  track("photo_triage_view_v1", { location: "route" });

  document.querySelectorAll("[data-guide-link]").forEach((link) => {
    link.addEventListener("click", () => track("photo_triage_shot_guide_v1", { location: "hero" }));
  });

  const routeSection = document.querySelector("#routes");
  const inspectionSection = document.querySelector(".inspection");
  const observed = new Set();

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || observed.has(entry.target)) return;
        observed.add(entry.target);
        if (entry.target === routeSection) track("photo_triage_route_view_v1", { location: "routes" });
        if (entry.target === inspectionSection) track("photo_triage_inspection_view_v1", { location: "inspection" });
      });
    }, { threshold: .35 });
    if (routeSection) observer.observe(routeSection);
    if (inspectionSection) observer.observe(inspectionSection);
  }

  document.querySelectorAll("[data-photo-cta]").forEach((link) => {
    link.addEventListener("click", async () => {
      const partner = context.partner_code ? ` Партнерский код: ${context.partner_code}.` : "";
      const message = `Добрый день! Хочу понять следующий шаг по кузову. Прикладываю 3 фото: 1) деталь целиком, 2) след крупно, 3) поверхность под углом к свету. Автомобиль: [марка и модель]. Когда заметил и что уже пробовал: [...]. Код обращения: ${CHANNEL_CODE}.${partner}`;
      try { await navigator.clipboard.writeText(message); } catch (_) { /* Telegram still opens. */ }
      track("photo_triage_telegram_click_v1", {
        location: link.dataset.location || "unknown",
        destination: "telegram"
      });
      track("lead_telegram_polish_film_v8", {
        location: "photo_triage",
        destination: "telegram",
        channel_code: CHANNEL_CODE
      });
    });
  });

  window.__OHTAAWA_PHOTO_TRIAGE__ = { context, track, isQa };
})();
