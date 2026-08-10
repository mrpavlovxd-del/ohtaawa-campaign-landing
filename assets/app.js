(() => {
  "use strict";

  const configNode = document.getElementById("landing-config");
  const config = configNode ? JSON.parse(configNode.textContent || "{}") : {};
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
  const qaValuePattern = /(^|[\s_-])(qa|codex|smoke)(?=$|[\s_-])/;
  const isQa =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    qaTokens.some((token) => params.has(token)) ||
    qaValuePattern.test(qaMarker);

  const compact = (value, fallback = "") => {
    const normalized = String(value ?? fallback).trim().slice(0, 160);
    return normalized || fallback;
  };

  const attribution = {
    utm_source: compact(params.get("utm_source"), "direct"),
    utm_medium: compact(params.get("utm_medium"), "none"),
    utm_campaign: compact(params.get("utm_campaign"), "none"),
    utm_content: compact(params.get("utm_content"), "none"),
    utm_term: compact(params.get("utm_term"), "none"),
    scenario: compact(params.get("scenario"), "control"),
    experiment_id: compact(params.get("experiment_id"), config.experimentId || "wave45_control"),
    service_route: compact(config.serviceRoute, "film_full"),
    offer_id: compact(config.offerId, "full_film_fixed_180"),
    landing_version: compact(config.landingVersion, "wave45-proof-first"),
  };
  const qaEvents = [];

  document.body.dataset.scenario = attribution.scenario;
  document.body.dataset.experiment = attribution.experiment_id;

  const initMessageMatch = () => {
    const eyebrow = document.querySelector("[data-hero-eyebrow-copy]");
    const lead = document.querySelector("[data-hero-lead]");
    if (!eyebrow || !lead) return;

    if (attribution.utm_content === "newcar_fullfilm") {
      eyebrow.textContent = "НОВЫЙ АВТОМОБИЛЬ · OHTAAWA";
      lead.textContent =
        "Защитите новый кузов до первых сколов. Премиальная прозрачная пленка, подготовка, монтаж и финальный контроль уже входят в стоимость.";
      return;
    }

    if (attribution.utm_content === "price_install_fullfilm") {
      eyebrow.textContent = "ФИКСИРОВАННАЯ ЦЕНА · OHTAAWA";
      lead.textContent =
        "Окрашенные элементы кузова, подготовка автомобиля, монтаж и финальный контроль — в одном пакете за 180 000 ₽.";
    }
  };
  initMessageMatch();

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

  const revealNodes = [...document.querySelectorAll("[data-reveal]")];
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px" },
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
          const eventName = entry.target.dataset.viewEvent;
          if (!eventName || viewedEvents.has(eventName)) return;
          viewedEvents.add(eventName);
          track(eventName, { visible_ratio: Number(entry.intersectionRatio.toFixed(2)) });
        });
      },
      { threshold: [0.45] },
    );
    viewNodes.forEach((node) => viewObserver.observe(node));
  }

  track("landing_view", {
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    referrer_host: document.referrer ? new URL(document.referrer).hostname : "direct",
  });

  const reachedScroll = new Set();
  const configuredScrollGoals = config.scrollGoals || {};
  const scrollGoals = {
    50: compact(configuredScrollGoals["50"], "landing_scroll_50_polish_film_v8"),
    90: compact(configuredScrollGoals["90"], "landing_scroll_90_polish_film_v8"),
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
  let contactLocation = "unknown";
  const setDialogState = (open) => document.body.classList.toggle("dialog-open", open);

  document.querySelectorAll("[data-open-contact]").forEach((button) => {
    button.addEventListener("click", () => {
      contactLocation = compact(button.dataset.contactLocation, "unknown");
      track("contact_sheet_open", { location: contactLocation });
      if (contactDialog?.showModal) {
        contactDialog.showModal();
        setDialogState(true);
      }
    });
  });

  document.querySelector("[data-close-contact]")?.addEventListener("click", () => {
    contactDialog?.close();
  });

  contactDialog?.addEventListener("close", () => setDialogState(false));
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
        }),
      );
    } catch {
      // Analytics must never block the contact path.
    }
  };

  const defaultContactGoalByChannel = {
    phone: "lead_phone_polish_film_v8",
    telegram: "lead_telegram_polish_film_v8",
    whatsapp: "lead_whatsapp_polish_film_v8",
    max: "lead_max_direct_polish_film_v8",
  };
  const contactGoalByChannel = {
    ...defaultContactGoalByChannel,
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
      track("contact_channel_click", {
        channel,
        location: contactLocation,
      });
      const contactGoal = contactGoalByChannel[channel];
      if (contactGoal) {
        track(contactGoal, {
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

  const carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    const mainImage = carousel.querySelector("[data-carousel-main]");
    const title = carousel.querySelector("[data-carousel-title]");
    const copy = carousel.querySelector("[data-carousel-copy]");
    const counter = carousel.querySelector("[data-carousel-counter]");
    const tabs = [...carousel.querySelectorAll("[data-slide]")];
    const previous = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    const open = carousel.querySelector("[data-carousel-open]");
    const gallery = document.getElementById("gallery-dialog");
    const galleryImage = gallery?.querySelector("[data-gallery-image]");
    const galleryTitle = gallery?.querySelector("[data-gallery-title]");
    let activeIndex = 0;
    let carouselTimer = 0;
    let touchStart = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const selectSlide = (index, interaction = "auto") => {
      if (!tabs.length || !mainImage || !title || !copy || !counter) return;
      activeIndex = (index + tabs.length) % tabs.length;
      const selected = tabs[activeIndex];

      mainImage.style.opacity = "0.2";
      window.setTimeout(() => {
        mainImage.src = selected.dataset.src || mainImage.src;
        mainImage.alt = selected.dataset.alt || "";
        title.textContent = selected.dataset.title || "";
        copy.textContent = selected.dataset.copy || "";
        counter.textContent =
          String(activeIndex + 1).padStart(2, "0") +
          " / " +
          String(tabs.length).padStart(2, "0");
        const decoded = mainImage.decode ? mainImage.decode() : Promise.resolve();
        decoded.catch(() => {}).finally(() => {
          mainImage.style.opacity = "1";
        });
      }, reducedMotion ? 0 : 120);

      tabs.forEach((tab, indexValue) => {
        const isSelected = indexValue === activeIndex;
        tab.setAttribute("aria-selected", String(isSelected));
        tab.tabIndex = isSelected ? 0 : -1;
      });

      if (interaction !== "auto" && interaction !== "initial") {
        track("proof_carousel_interaction", {
          interaction,
          slide: activeIndex + 1,
          slide_title: compact(selected.dataset.title),
        });
      }
    };

    const stopAutoplay = () => window.clearInterval(carouselTimer);
    const startAutoplay = () => {
      stopAutoplay();
      if (reducedMotion || document.hidden) return;
      carouselTimer = window.setInterval(() => selectSlide(activeIndex + 1, "auto"), 7000);
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        selectSlide(index, "thumbnail");
        startAutoplay();
      });
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        selectSlide(activeIndex + (event.key === "ArrowRight" ? 1 : -1), "keyboard");
        tabs[activeIndex]?.focus();
      });
    });

    previous?.addEventListener("click", () => {
      selectSlide(activeIndex - 1, "previous");
      startAutoplay();
    });
    next?.addEventListener("click", () => {
      selectSlide(activeIndex + 1, "next");
      startAutoplay();
    });

    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
    carousel.addEventListener("focusin", stopAutoplay);
    carousel.addEventListener("focusout", startAutoplay);
    carousel.addEventListener(
      "touchstart",
      (event) => {
        touchStart = event.changedTouches[0]?.clientX || 0;
        stopAutoplay();
      },
      { passive: true },
    );
    carousel.addEventListener(
      "touchend",
      (event) => {
        const touchEnd = event.changedTouches[0]?.clientX || 0;
        const distance = touchEnd - touchStart;
        if (Math.abs(distance) > 55) {
          selectSlide(activeIndex + (distance < 0 ? 1 : -1), "swipe");
        }
        startAutoplay();
      },
      { passive: true },
    );

    open?.addEventListener("click", () => {
      if (!gallery?.showModal || !galleryImage || !galleryTitle || !mainImage || !title) return;
      galleryImage.src = mainImage.src;
      galleryImage.alt = mainImage.alt;
      galleryTitle.textContent = title.textContent;
      gallery.showModal();
      setDialogState(true);
      track("proof_gallery_open", { slide: activeIndex + 1 });
    });

    gallery?.querySelector("[data-gallery-close]")?.addEventListener("click", () => gallery.close());
    gallery?.addEventListener("click", (event) => {
      if (event.target === gallery) gallery.close();
    });
    gallery?.addEventListener("close", () => setDialogState(false));

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });

    selectSlide(0, "initial");
    startAutoplay();
  }

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      timeZone: "Europe/Moscow",
    }).format(date);
  };

  const initUrgency = () => {
    const panel = document.querySelector("[data-urgency-panel]");
    if (!panel) return;

    const variant = compact(params.get("urgency"), config.urgencyDefault || "control");
    const supported = ["deadline", "week", "countdown", "three_days"];
    if (!supported.includes(variant)) return;

    const deadlineValue = variant === "week" ? config.weekDeadline : config.campaignDeadline;
    const deadline = new Date(deadlineValue);
    const now = new Date();
    if (Number.isNaN(deadline.getTime()) || deadline <= now) return;

    const title = panel.querySelector("[data-urgency-title]");
    const copy = panel.querySelector("[data-urgency-copy]");
    const label = panel.querySelector("[data-urgency-label]");
    const countdown = panel.querySelector("[data-countdown]");
    const remainingDays = Math.max(1, Math.ceil((deadline - now) / 86400000));

    panel.hidden = false;
    document.body.dataset.urgency = variant;
    label.textContent = variant === "week" ? "Предложение этой недели" : "Ограниченное предложение";

    if (variant === "three_days") {
      title.textContent =
        remainingDays <= 3
          ? "До завершения — " + remainingDays + " дн."
          : "Цена действует до " + formatDate(deadlineValue);
      copy.textContent = "До указанной даты можно зафиксировать полную оклейку кузова по цене 180 000 ₽.";
    } else if (variant === "week") {
      title.textContent = "Цена 180 000 ₽ действует до " + formatDate(deadlineValue);
      copy.textContent = "Запись можно выбрать на удобную дату после завершения недели.";
    } else {
      title.textContent = "Цена 180 000 ₽ действует до " + formatDate(deadlineValue);
      copy.textContent = "До этой даты можно зафиксировать стоимость полной оклейки кузова.";
    }

    if (variant === "countdown") {
      countdown.hidden = false;
      const daysNode = countdown.querySelector("[data-countdown-days]");
      const hoursNode = countdown.querySelector("[data-countdown-hours]");
      const update = () => {
        const distance = deadline - new Date();
        if (distance <= 0) {
          panel.hidden = true;
          return;
        }
        const days = Math.floor(distance / 86400000);
        const hours = Math.floor((distance % 86400000) / 3600000);
        daysNode.textContent = String(days).padStart(2, "0");
        hoursNode.textContent = String(hours).padStart(2, "0");
      };
      update();
      window.setInterval(update, 60000);
    }

    track("urgency_variant_view", {
      urgency_variant: variant,
      urgency_deadline: deadline.toISOString(),
    });
  };
  initUrgency();

  document.querySelectorAll(".faq-list details").forEach((details, index) => {
    details.addEventListener("toggle", () => {
      if (!details.open) return;
      track("faq_open", {
        faq_index: index + 1,
        faq_question: compact(details.querySelector("summary")?.textContent),
      });
    });
  });
})();
