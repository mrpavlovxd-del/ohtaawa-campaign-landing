(() => {
  "use strict";

  const configNode = document.getElementById("landing-config");
  const config = configNode ? JSON.parse(configNode.textContent || "{}") : {};
  const params = new URLSearchParams(window.location.search);
  const compact = (value, fallback = "") => {
    const normalized = String(value ?? fallback).trim().slice(0, 180);
    return normalized || fallback;
  };

  const qaMarker = [
    params.get("utm_source"),
    params.get("utm_medium"),
    params.get("utm_campaign"),
    params.get("utm_content"),
    params.get("scenario"),
    params.get("experiment_id"),
  ].filter(Boolean).join(" ").toLowerCase();
  const isQa =
    ["localhost", "127.0.0.1"].includes(window.location.hostname.toLowerCase()) ||
    ["qa", "codex", "smoke", "_ym_debug"].some((token) => params.has(token)) ||
    /(^|[\s_-])(qa|codex|smoke)(?=$|[\s_-])/.test(qaMarker);

  const attribution = {
    utm_source: compact(params.get("utm_source"), "direct"),
    utm_medium: compact(params.get("utm_medium"), "none"),
    utm_campaign: compact(params.get("utm_campaign"), "none"),
    utm_content: compact(params.get("utm_content"), "control"),
    utm_term: compact(params.get("utm_term"), "none"),
    scenario: compact(params.get("scenario"), config.scenario || "risk-zones"),
    experiment_id: compact(params.get("experiment_id"), config.experimentId || "wave46_ya_search_risk_zones_60k_control"),
    service_route: compact(config.serviceRoute, "risk_zones"),
    offer_id: compact(config.offerId, "risk_zones_fixed_60"),
    landing_version: compact(config.landingVersion, "wave46-risk-zones-v1"),
  };
  const qaEvents = [];

  document.body.dataset.scenario = attribution.scenario;
  document.body.dataset.experiment = attribution.experiment_id;

  const variant = config.messageVariants?.[attribution.utm_content];
  if (variant) {
    const eyebrow = document.querySelector("[data-hero-eyebrow-copy]");
    const lead = document.querySelector("[data-hero-lead]");
    if (eyebrow && variant.eyebrow) eyebrow.textContent = variant.eyebrow;
    if (lead && variant.lead) lead.textContent = variant.lead;
  }

  const loadMetrika = () => {
    const counter = Number(config.metrikaCounter);
    if (!counter || isQa) return;
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
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
    window.dispatchEvent(new CustomEvent("ohtaawa:track", {
      detail: { event, payload, qa: isQa },
    }));
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

  window.ohtaawaAnalytics = { config, attribution, isQa, qaEvents, track };
  loadMetrika();

  const header = document.querySelector("[data-header]");
  const syncHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  const revealNodes = [...document.querySelectorAll("[data-reveal]")];
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px" });
    revealNodes.forEach((node) => revealObserver.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }

  const viewedEvents = new Set();
  if ("IntersectionObserver" in window) {
    const viewObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const eventName = entry.target.dataset.viewEvent;
        if (!entry.isIntersecting || !eventName || viewedEvents.has(eventName)) return;
        viewedEvents.add(eventName);
        track(eventName, { visible_ratio: Number(entry.intersectionRatio.toFixed(2)) });
      });
    }, { threshold: [0.45] });
    document.querySelectorAll("[data-view-event]").forEach((node) => viewObserver.observe(node));
  }

  track(config.events?.landingView || "landing_view_risk_zones_v1", {
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    referrer_host: document.referrer ? new URL(document.referrer).hostname : "direct",
  });

  const reachedScroll = new Set();
  const scrollGoals = {
    50: config.events?.scroll50 || "scroll_50_risk_zones_v1",
    90: config.events?.scroll90 || "scroll_90_risk_zones_v1",
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
    node.addEventListener("click", () => track(node.dataset.trackEvent, {
      location: compact(node.dataset.trackLocation, "unknown"),
    }));
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
  let contactLocation = "unknown";
  const setDialogState = (open) => document.body.classList.toggle("dialog-open", open);
  document.querySelectorAll("[data-open-contact]").forEach((button) => {
    button.addEventListener("click", () => {
      contactLocation = compact(button.dataset.contactLocation, "unknown");
      track(config.events?.contactOpen || "contact_sheet_open_risk_zones_v1", { location: contactLocation });
      if (contactDialog?.showModal) {
        contactDialog.showModal();
        setDialogState(true);
      }
    });
  });
  document.querySelector("[data-close-contact]")?.addEventListener("click", () => contactDialog?.close());
  contactDialog?.addEventListener("close", () => setDialogState(false));
  contactDialog?.addEventListener("click", (event) => {
    if (event.target === contactDialog) contactDialog.close();
  });

  const contactGoals = {
    telegram: config.events?.telegram || "lead_telegram_risk_zones_v1",
    whatsapp: config.events?.whatsapp || "lead_whatsapp_risk_zones_v1",
    max: config.events?.max || "lead_max_risk_zones_v1",
    phone: config.events?.phone || "lead_phone_risk_zones_v1",
  };
  document.querySelectorAll("[data-channel]").forEach((link) => {
    const channel = compact(link.dataset.channel, "unknown");
    const message = compact(link.dataset.copyMessage);
    if (channel === "whatsapp" && message) {
      const base = compact(config.whatsappUrl, link.href);
      link.href = base + (base.includes("?") ? "&" : "?") + "text=" + encodeURIComponent(message);
    }
    link.addEventListener("click", () => {
      track("contact_channel_click_risk_zones_v1", { channel, location: contactLocation });
      if (contactGoals[channel]) track(contactGoals[channel], { channel, location: contactLocation });
      if ((channel === "telegram" || channel === "max") && message && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(message)
          .then(() => showToast("Текст обращения скопирован. Вставьте его в открывшийся чат."))
          .catch(() => {});
      }
    });
  });

  const carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    const mainImage = carousel.querySelector("[data-carousel-main]");
    const title = carousel.querySelector("[data-carousel-title]");
    const copy = carousel.querySelector("[data-carousel-copy]");
    const counter = carousel.querySelector("[data-carousel-counter]");
    const tabs = [...carousel.querySelectorAll("[data-slide]")];
    const gallery = document.getElementById("gallery-dialog");
    const galleryImage = gallery?.querySelector("[data-gallery-image]");
    const galleryTitle = gallery?.querySelector("[data-gallery-title]");
    let activeIndex = 0;
    let touchStart = 0;

    const selectSlide = (index, interaction = "auto") => {
      if (!tabs.length || !mainImage || !title || !copy || !counter) return;
      activeIndex = (index + tabs.length) % tabs.length;
      const selected = tabs[activeIndex];
      mainImage.src = selected.dataset.src;
      mainImage.alt = selected.dataset.alt || "";
      title.textContent = selected.dataset.title || "";
      copy.textContent = selected.dataset.copy || "";
      counter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(tabs.length).padStart(2, "0")}`;
      tabs.forEach((tab, tabIndex) => tab.setAttribute("aria-selected", String(tabIndex === activeIndex)));
      if (interaction !== "auto") {
        track(config.events?.proofCarousel || "proof_carousel_risk_zones_v1", {
          slide: activeIndex + 1,
          interaction,
        });
      }
    };

    tabs.forEach((tab, index) => tab.addEventListener("click", () => selectSlide(index, "thumbnail")));
    carousel.querySelector("[data-carousel-prev]")?.addEventListener("click", () => selectSlide(activeIndex - 1, "previous"));
    carousel.querySelector("[data-carousel-next]")?.addEventListener("click", () => selectSlide(activeIndex + 1, "next"));
    carousel.addEventListener("touchstart", (event) => { touchStart = event.touches[0]?.clientX || 0; }, { passive: true });
    carousel.addEventListener("touchend", (event) => {
      const delta = (event.changedTouches[0]?.clientX || 0) - touchStart;
      if (Math.abs(delta) > 50) selectSlide(activeIndex + (delta < 0 ? 1 : -1), "swipe");
    }, { passive: true });
    carousel.querySelector("[data-carousel-open]")?.addEventListener("click", () => {
      if (!gallery?.showModal || !galleryImage || !galleryTitle) return;
      galleryImage.src = mainImage.src;
      galleryImage.alt = mainImage.alt;
      galleryTitle.textContent = title.textContent;
      gallery.showModal();
      setDialogState(true);
      track("proof_gallery_open_risk_zones_v1", { slide: activeIndex + 1 });
    });
    gallery?.querySelector("[data-gallery-close]")?.addEventListener("click", () => gallery.close());
    gallery?.addEventListener("close", () => setDialogState(false));
    gallery?.addEventListener("click", (event) => { if (event.target === gallery) gallery.close(); });
    selectSlide(0);
  }

  document.querySelectorAll(".faq-list details").forEach((item, index) => {
    item.addEventListener("toggle", () => {
      if (item.open) track(config.events?.faq || "faq_open_risk_zones_v1", { item: index + 1 });
    });
  });
})();
