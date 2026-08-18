(() => {
  "use strict";

  const configNode = document.getElementById("landing-config");
  let config = {};
  try {
    config = configNode ? JSON.parse(configNode.textContent || "{}") : {};
  } catch {
    config = {};
  }

  const params = new URLSearchParams(window.location.search);
  const hostname = window.location.hostname.toLowerCase();
  const qaTokens = ["qa", "codex", "smoke", "_ym_debug"];
  const qaMarker = [
    params.get("utm_source"),
    params.get("utm_medium"),
    params.get("utm_campaign"),
    params.get("utm_content"),
    params.get("scenario"),
    params.get("experiment_id"),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const qaPattern = /(^|[\s_-])(qa|codex|smoke)(?=$|[\s_-])/;
  const isQa =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    qaTokens.some((token) => params.has(token)) ||
    qaPattern.test(qaMarker);

  const compact = (value, fallback = "") => {
    const normalized = String(value ?? fallback).trim().slice(0, 160);
    return normalized || fallback;
  };

  const safeReferrerHost = () => {
    if (!document.referrer) return "direct";
    try {
      return new URL(document.referrer).hostname || "direct";
    } catch {
      return "unknown";
    }
  };

  const attribution = {
    utm_source: compact(params.get("utm_source"), "direct"),
    utm_medium: compact(params.get("utm_medium"), "none"),
    utm_campaign: compact(params.get("utm_campaign"), "none"),
    utm_content: compact(params.get("utm_content"), "none"),
    utm_term: compact(params.get("utm_term"), "none"),
    scenario: compact(params.get("scenario"), config.scenarioDefault || "leather_care_fixed_3500"),
    experiment_id: compact(params.get("experiment_id"), config.experimentId || "wave53"),
    service_route: compact(config.serviceRoute, "leather_care"),
    offer_id: compact(config.offerId, "leather_care_koch_fixed_3500"),
    landing_version: compact(config.landingVersion, "wave53-leather-care-v1"),
  };
  const qaEvents = [];

  document.body.dataset.scenario = attribution.scenario;
  document.body.dataset.experiment = attribution.experiment_id;
  document.body.dataset.qa = String(isQa);

  const loadMetrika = () => {
    const counter = Number(config.metrikaCounter);
    if (!counter || isQa) return;

    window.ym =
      window.ym ||
      function () {
        (window.ym.a = window.ym.a || []).push(arguments);
      };
    window.ym.l = Date.now();

    if (!document.querySelector('script[src*="mc.yandex.ru/metrika/tag.js"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://mc.yandex.ru/metrika/tag.js";
      document.head.appendChild(script);
    }

    window.ym(counter, "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
    });
  };

  const track = (eventName, details = {}) => {
    const event = compact(eventName);
    if (!event) return;

    const payload = {
      ...attribution,
      ...details,
      event_time: new Date().toISOString(),
      page_path: window.location.pathname,
    };

    window.dispatchEvent(
      new CustomEvent("ohtaawa:track", {
        detail: { event, payload, qa: isQa },
      }),
    );

    if (isQa) {
      qaEvents.push({ event, payload });
      configNode?.setAttribute("data-qa-events", JSON.stringify(qaEvents));
    }

    if (!isQa && Number(config.metrikaCounter) && typeof window.ym === "function") {
      window.ym(Number(config.metrikaCounter), "reachGoal", event, payload);
      window.ym(Number(config.metrikaCounter), "params", {
        ohtaawa_event: { name: event, ...payload },
      });
    }
  };

  window.ohtaawaAnalytics = {
    config,
    attribution,
    isQa,
    qaEvents,
    track,
  };

  loadMetrika();

  const header = document.querySelector("[data-header]");
  const syncHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealNodes = [...document.querySelectorAll("[data-reveal]")];
  if (!reducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px" },
    );
    revealNodes.forEach((node) => revealObserver.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }

  const viewedEvents = new Set();
  const viewNodes = [...document.querySelectorAll("[data-view-event]")];
  if ("IntersectionObserver" in window) {
    const viewObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const eventName = compact(entry.target.dataset.viewEvent);
          if (!eventName || viewedEvents.has(eventName)) return;
          viewedEvents.add(eventName);
          track(eventName, { visible_ratio: Number(entry.intersectionRatio.toFixed(2)) });
        });
      },
      { threshold: [0.45] },
    );
    viewNodes.forEach((node) => viewObserver.observe(node));
  }

  track(config.pageViewGoal || "landing_view_leather_care_w53", {
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    referrer_host: safeReferrerHost(),
  });

  const reachedScroll = new Set();
  const scrollGoals = {
    50: compact(config.scrollGoals?.["50"], "landing_scroll_50_leather_care_w53"),
    90: compact(config.scrollGoals?.["90"], "landing_scroll_90_leather_care_w53"),
  };
  const trackScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const progress = Math.round((window.scrollY / scrollable) * 100);
    [50, 90].forEach((threshold) => {
      if (progress < threshold || reachedScroll.has(threshold)) return;
      reachedScroll.add(threshold);
      track(scrollGoals[threshold], { scroll_percent: threshold });
    });
  };
  window.addEventListener("scroll", trackScroll, { passive: true });

  document.querySelectorAll("[data-track-event]").forEach((node) => {
    node.addEventListener("click", () => {
      track(node.dataset.trackEvent, {
        location: compact(node.dataset.trackLocation, "unknown"),
      });
    });
  });

  const toast = document.querySelector("[data-toast]");
  let toastTimer = 0;
  const showToast = (message) => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
  };

  const contactDialog = document.getElementById("contact-sheet");
  let contactLocation = "direct";
  const setDialogState = (open) => document.body.classList.toggle("dialog-open", open);

  document.querySelectorAll("[data-open-contact]").forEach((button) => {
    button.addEventListener("click", () => {
      contactLocation = compact(button.dataset.contactLocation, "unknown");
      track(config.contactSheetGoal || "contact_sheet_open_leather_care_w53", {
        location: contactLocation,
      });
      if (contactDialog?.showModal) {
        contactDialog.showModal();
        setDialogState(true);
      } else if (contactDialog) {
        contactDialog.setAttribute("open", "");
        setDialogState(true);
      }
    });
  });

  document.querySelector("[data-close-contact]")?.addEventListener("click", () => {
    contactDialog?.close();
  });

  contactDialog?.addEventListener("close", () => setDialogState(false));
  contactDialog?.addEventListener("cancel", () => setDialogState(false));
  contactDialog?.addEventListener("click", (event) => {
    if (event.target === contactDialog) contactDialog.close();
  });

  const rememberContactSignal = (channel) => {
    try {
      sessionStorage.setItem(
        "ohtaawa_last_contact_signal",
        JSON.stringify({
          channel,
          location: contactLocation,
          at: new Date().toISOString(),
          campaign: attribution.utm_campaign,
          source: attribution.utm_source,
          service_route: attribution.service_route,
        }),
      );
    } catch {
      // Analytics must never block the contact path.
    }
  };

  const contactGoals = {
    phone: "lead_phone_leather_care_w53",
    telegram: "lead_telegram_leather_care_w53",
    whatsapp: "lead_whatsapp_leather_care_w53",
    max: "lead_max_leather_care_w53",
    ...(config.contactGoals || {}),
  };

  document.querySelectorAll("[data-channel]").forEach((link) => {
    const channel = compact(link.dataset.channel, "unknown");
    const message = compact(link.dataset.copyMessage);

    if (channel === "whatsapp" && message) {
      const base = compact(config.whatsappUrl, link.href);
      link.href = base + (base.includes("?") ? "&" : "?") + "text=" + encodeURIComponent(message);
    }

    link.addEventListener("click", () => {
      rememberContactSignal(channel);
      track(config.contactChannelGoal || "contact_channel_click_leather_care_w53", {
        channel,
        location: contactLocation,
      });
      if (contactGoals[channel]) {
        track(contactGoals[channel], {
          channel,
          location: contactLocation,
        });
      }

      if ((channel === "telegram" || channel === "max") && message && navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(message)
          .then(() => showToast("Текст обращения скопирован. Вставьте его в открывшийся чат."))
          .catch(() => {});
      }
    });
  });

  const mapFrame = document.querySelector("[data-map-src]");
  if (mapFrame && !isQa) {
    const loadMap = () => {
      if (mapFrame.src) return;
      mapFrame.addEventListener("load", () => mapFrame.classList.add("is-loaded"), { once: true });
      mapFrame.src = mapFrame.dataset.mapSrc;
    };

    if ("IntersectionObserver" in window) {
      const mapObserver = new IntersectionObserver(
        (entries, observer) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          loadMap();
          observer.disconnect();
        },
        { rootMargin: "300px" },
      );
      mapObserver.observe(mapFrame);
    } else {
      loadMap();
    }
  }
})();
