/* Qwen Full Film Pass 2 - Interactions */
(() => {
  "use strict";

  /* SOL-007: Save-Data / slow connection detection */
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = (conn && conn.saveData) || false;
  const slowConn = conn && ["slow-2g","2g"].includes(conn.effectiveType);
  if (saveData || slowConn) {
    document.documentElement.classList.add("save-data");
    document.body.classList.add("save-data");
  }

  /* Shared primitives - must exist before first use */
  const params = new URLSearchParams(window.location.search);
  const compact = (v, fb) => String(v != null ? v : fb || "").trim().slice(0, 160) || (fb || "");

  /* V2.1: UTM message-match - deterministic hero copy variants before first paint */
  const utmContent = compact(params.get("utm_content"), "").toLowerCase();
  let messageVariant = "default";
  if (utmContent === "newcar_fullfilm") messageVariant = "newcar";
  else if (utmContent === "price_install_fullfilm") messageVariant = "price";
  /* Apply variant to body before any paint */
  if (messageVariant !== "default") document.body.setAttribute("data-msg-variant", messageVariant);


  /* Config & QA isolation */
  const configNode = document.getElementById("landing-config");
  const config = configNode ? JSON.parse(configNode.textContent || "{}") : {};
  const hostname = window.location.hostname.toLowerCase();
  const qaTokens = ["qa","codex","smoke","_ym_debug"];
  const qaMarker = ["utm_source","utm_medium","utm_campaign","utm_content","scenario","experiment_id"]
    .map(k => params.get(k)).filter(Boolean).join(" ").toLowerCase();
  const qaPattern = /(^|[\s_-])(qa|codex|smoke)(?=$|[\s_-])/;
  const isQa = hostname === "localhost" || hostname === "127.0.0.1" ||
    qaTokens.some(t => params.has(t)) || qaPattern.test(qaMarker);

  /* SOL-006: Restore attribution fields including scenario and experiment_id */
  const attribution = {
    utm_source: compact(params.get("utm_source"), "direct"),
    utm_medium: compact(params.get("utm_medium"), "none"),
    utm_campaign: compact(params.get("utm_campaign"), "none"),
    utm_content: compact(params.get("utm_content"), "none"),
    utm_term: compact(params.get("utm_term"), "none"),
    scenario: compact(params.get("scenario"), config.scenario || "qwen_full_film_reinvention"),
    experiment_id: compact(params.get("experiment_id"), config.experimentId || "qwen_tension_v2"),
    landing_version: config.landingVersion || "qwen-reinvention-v2",
    service_route: config.serviceRoute || "film_full",
    offer_id: config.offerId || "full_film_fixed_180",
    message_variant: messageVariant,
  };
  const qaEvents = [];

  /* Analytics */
  const loadMetrika = () => {
    const counter = Number(config.metrikaCounter);
    if (!counter || isQa) return;
    window.ym = window.ym || function() { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    if (!document.querySelector('script[src*="mc.yandex.ru/metrika/tag.js"]')) {
      const s = document.createElement("script");
      s.async = true; s.src = "https://mc.yandex.ru/metrika/tag.js";
      document.head.appendChild(s);
    }
    window.ym(counter, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
  };

  const track = (name, data) => {
    const ev = compact(name); if (!ev) return;
    const payload = Object.assign({}, attribution, data || {}, { event_time: new Date().toISOString(), page_path: window.location.pathname });
    window.dispatchEvent(new CustomEvent("ohtaawa:track", { detail: { event: ev, payload: payload, qa: isQa } }));
    if (isQa) { qaEvents.push({ event: ev, payload: payload }); if (configNode) configNode.setAttribute("data-qa-events", JSON.stringify(qaEvents)); }
    if (!isQa && Number(config.metrikaCounter) && typeof window.ym === "function") {
      window.ym(Number(config.metrikaCounter), "reachGoal", ev, payload);
      window.ym(Number(config.metrikaCounter), "params", { ohtaawa_event: Object.assign({ name: ev }, payload) });
    }
  };

  window.ohtaawaAnalytics = { config: config, attribution: attribution, isQa: isQa, qaEvents: qaEvents, track: track, saveData: saveData };
  loadMetrika();
  /* Header scroll */
  const header = document.querySelector("[data-header]");
  const syncHeader = () => { if (header) header.classList.toggle("is-scrolled", window.scrollY > 24); };
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  /* V2.1: Content is ALWAYS visible. Reveal is transform-only enhancement, never gates visibility. */
  document.body.classList.add("js-ready");
  const revealNodes = Array.from(document.querySelectorAll("[data-reveal]"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const skipReveal = reducedMotion || saveData || slowConn;

  if (skipReveal || !("IntersectionObserver" in window)) {
    /* No animation: everything is already visible, just mark as revealed */
    revealNodes.forEach(n => { n.classList.add("q-revealed"); });
  } else {
    /* Add pending class for subtle transform animation (NOT opacity - content is always visible) */
    revealNodes.forEach(n => n.classList.add("q-reveal-pending"));
    const ro = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("q-revealed");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -10px" });
    revealNodes.forEach(n => {
      /* If already in viewport, reveal immediately */
      const rect = n.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        n.classList.add("q-revealed");
      } else {
        ro.observe(n);
      }
    });
  }

  /* View events */
  const viewedSet = new Set();
  const viewNodes = Array.from(document.querySelectorAll("[data-view-event]"));
  if ("IntersectionObserver" in window) {
    const vo = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const ev = e.target.dataset.viewEvent;
        if (!ev || viewedSet.has(ev)) return;
        viewedSet.add(ev);
        track(ev, { visible_ratio: Number(e.intersectionRatio.toFixed(2)) });
      });
    }, { threshold: [0.4] });
    viewNodes.forEach(n => vo.observe(n));
  }

  track("landing_view", { viewport_width: window.innerWidth, viewport_height: window.innerHeight, referrer_host: document.referrer ? new URL(document.referrer).hostname : "direct", message_variant: messageVariant });

  /* Scroll depth */
  const scrollReached = new Set();
  const trackScroll = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (total <= 0) return;
    const pct = Math.round((window.scrollY / total) * 100);
    [50, 90].forEach(t => {
      if (pct < t || scrollReached.has(t)) return;
      scrollReached.add(t);
      track(t === 50 ? "landing_scroll_50_polish_film_v8" : "landing_scroll_90_polish_film_v8", { scroll_percent: t });
    });
  };
  window.addEventListener("scroll", trackScroll, { passive: true });

  /* SOL-005: Click tracking with explicit contact location */
  document.querySelectorAll("[data-track-event]").forEach(el => {
    el.addEventListener("click", () => {
      track(el.dataset.trackEvent, { location: compact(el.dataset.contactLocation || el.dataset.trackLocation, "page") });
    });
  });

  /* Toast */
  const toast = document.querySelector("[data-toast]");
  let toastTimer = 0;
  const showToast = (msg) => {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.classList.add("is-visible");
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3500);
  };

  /* Contact dialog */
  const dialog = document.getElementById("contact-dialog");
  let contactLoc = "page";
  let dialogTrigger = null; /* V2.2: track opener for focus return */
  document.querySelectorAll("[data-open-contact]").forEach(btn => {
    btn.addEventListener("click", () => {
      contactLoc = compact(btn.dataset.contactLocation, "page");
      track("contact_sheet_open", { location: contactLoc });
      dialogTrigger = btn; /* V2.2: store trigger for focus return */
      if (dialog && dialog.showModal) dialog.showModal();
      document.body.classList.add("dialog-open");
    });
  });
  const closeBtn = document.querySelector("[data-close-dialog]");
  if (closeBtn) closeBtn.addEventListener("click", () => { if (dialog) dialog.close(); });
  if (dialog) {
    /* V2.2: Focus return to trigger + explicit Tab/Shift+Tab focus trap */
    dialog.addEventListener("close", () => {
      document.body.classList.remove("dialog-open");
      if (dialogTrigger && typeof dialogTrigger.focus === "function") {
        dialogTrigger.focus();
      }
      dialogTrigger = null;
    });
    dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("keydown", e => {
      if (e.key !== "Tab" || !dialog.open) return;
      const focusable = dialog.querySelectorAll(
        'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  /* SOL-008: Car input - honest channel mechanics */
  const carInput = document.getElementById("q-car-input");
  const getCarMessage = () => {
    const car = carInput ? carInput.value.trim() : "";
    const base = "Добрый день! Хочу узнать о полной защитной оклейке кузова за 180 000 рублей.";
    return car ? (base + " Автомобиль: " + car + ".") : (base + " Автомобиль: [марка и модель].");
  };

  /* SOL-005+008: Channel clicks with honest Telegram/MAX behavior */
  const defaultGoals = {
    phone: "lead_phone_polish_film_v8",
    telegram: "lead_telegram_polish_film_v8",
    whatsapp: "lead_whatsapp_polish_film_v8",
    max: "lead_max_direct_polish_film_v8"
  };

  document.querySelectorAll("[data-channel]").forEach(link => {
    const ch = compact(link.dataset.channel, "unknown");
    const loc = compact(link.dataset.contactLocation, "page");

    /* WhatsApp: build URL with message at click time */
    link.addEventListener("click", () => {
      if (ch === "whatsapp") {
        const base = compact(config.whatsappUrl, "https://wa.me/79910102020");
        link.href = base + "?text=" + encodeURIComponent(getCarMessage());
      }

      track("contact_channel_click", { channel: ch, location: loc });
      const goal = defaultGoals[ch];
      if (goal) track(goal, { channel: ch, location: loc });

      /* V2.1: Telegram/MAX - copy message honestly, explain paste step, handle clipboard failure */
      if (ch === "telegram" || ch === "max") {
        const msg = getCarMessage();
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          navigator.clipboard.writeText(msg)
            .then(() => showToast("Текст скопирован — вставьте его в открывшийся чат."))
            .catch(() => {
              /* Clipboard failed - show manual fallback */
              showToast("Не удалось скопировать. Скопируйте текст вручную: " + msg.slice(0, 80) + "...");
              document.body.setAttribute("data-clipboard-unavailable", "true");
            });
        } else {
          /* No clipboard API at all */
          showToast("Скопируйте текст вручную: " + msg.slice(0, 80) + "...");
          document.body.setAttribute("data-clipboard-unavailable", "true");
        }
      }

      try {
        sessionStorage.setItem("ohtaawa_last_contact_signal", JSON.stringify({
          channel: ch, location: loc, at: new Date().toISOString(),
          utm_campaign: attribution.utm_campaign, utm_content: attribution.utm_content
        }));
      } catch(e) {}
    });
  });
  /* V2.1: Proof gallery - NO AUTOPLAY. Manual-only: arrows, tabs, swipe, keyboard. */
  const proofMain = document.querySelector("[data-proof-main]");
  const proofTitle = document.querySelector("[data-proof-title]");
  const proofCopy = document.querySelector("[data-proof-copy]");
  const proofCounter = document.querySelector("[data-proof-counter]");
  const proofTabs = Array.from(document.querySelectorAll(".q-proof-thumbs [data-slide]"));
  const proofPrev = document.querySelector("[data-proof-prev]");
  const proofNext = document.querySelector("[data-proof-next]");
  const proofWrap = document.querySelector(".q-proof-gallery");
  let activeSlide = 0;

  const selectSlide = (idx, interaction) => {
    if (!proofTabs.length || !proofMain || !proofTitle || !proofCopy || !proofCounter) return;
    activeSlide = ((idx % proofTabs.length) + proofTabs.length) % proofTabs.length;
    const tab = proofTabs[activeSlide];

    /* V2.1: No opacity flash during transition - just swap content */
    proofMain.src = tab.dataset.src || proofMain.src;
    proofMain.alt = tab.dataset.alt || "";
    proofTitle.textContent = tab.dataset.title || "";
    proofCopy.textContent = tab.dataset.copy || "";
    proofCounter.textContent = String(activeSlide + 1).padStart(2, "0") + " / " + String(proofTabs.length).padStart(2, "0");

    proofTabs.forEach((t, i) => {
      const sel = i === activeSlide;
      t.setAttribute("aria-selected", String(sel));
      t.tabIndex = sel ? 0 : -1;
    });

    if (interaction && interaction !== "initial") {
      track("proof_carousel_interaction", { interaction: interaction, slide: activeSlide + 1, slide_title: compact(tab.dataset.title) });
    }
  };

  /* Tab clicks */
  proofTabs.forEach((tab, i) => {
    tab.addEventListener("click", () => { selectSlide(i, "thumbnail"); });
    tab.addEventListener("keydown", e => {
      if (["ArrowLeft","ArrowRight","Home","End"].indexOf(e.key) < 0) return;
      e.preventDefault();
      let next = activeSlide;
      if (e.key === "ArrowRight") next = activeSlide + 1;
      else if (e.key === "ArrowLeft") next = activeSlide - 1;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = proofTabs.length - 1;
      selectSlide(next, "keyboard");
      if (proofTabs[activeSlide]) proofTabs[activeSlide].focus();
    });
  });

  /* Arrow buttons */
  if (proofPrev) proofPrev.addEventListener("click", () => { selectSlide(activeSlide - 1, "prev"); });
  if (proofNext) proofNext.addEventListener("click", () => { selectSlide(activeSlide + 1, "next"); });

  /* Touch swipe */
  let touchStartX = 0;
  if (proofWrap) {
    proofWrap.addEventListener("touchstart", e => { touchStartX = e.changedTouches[0] ? e.changedTouches[0].clientX : 0; }, { passive: true });
    proofWrap.addEventListener("touchend", e => {
      const dx = (e.changedTouches[0] ? e.changedTouches[0].clientX : 0) - touchStartX;
      if (Math.abs(dx) > 50) { selectSlide(activeSlide + (dx < 0 ? 1 : -1), "swipe"); }
    }, { passive: true });
  }

  /* Initial: show first slide */
  if (proofTabs.length) selectSlide(0, "initial");
  /* V2.3: Lazy load secondary proof thumbnails and trigger light sweep */
  const proofSection = document.getElementById("proof");
  const lazyThumbImgs = Array.from(document.querySelectorAll(".q-proof-thumbs img[data-src]"));
  let proofHydrated = false;

  const hydrateProofThumbs = () => {
    if (proofHydrated) return;
    proofHydrated = true;
    lazyThumbImgs.forEach(img => {
      const src = img.getAttribute("data-src");
      if (src) { img.src = src; img.removeAttribute("data-src"); }
    });
    document.body.classList.add("proof-hydrated");
  };

  /* Also hydrate when user navigates (in case IO hasn't fired yet) */
  const origSelectSlide = selectSlide;
  /* selectSlide is not reassignable (const), so we wrap navigation events instead */
  /* Add hydration call to each navigation handler */
  proofTabs.forEach((tab, i) => {
    const origClick = tab.onclick;
    tab.addEventListener("click", () => { if (!proofHydrated) hydrateProofThumbs(); });
  });
  if (proofPrev) proofPrev.addEventListener("click", () => { if (!proofHydrated) hydrateProofThumbs(); });
  if (proofNext) proofNext.addEventListener("click", () => { if (!proofHydrated) hydrateProofThumbs(); });

  if (proofSection && "IntersectionObserver" in window && !saveData) {
    const proofIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { hydrateProofThumbs(); proofIO.disconnect(); }
      });
    }, { rootMargin: "200px 0px" });
    proofIO.observe(proofSection);
  } else if (!saveData) {
    hydrateProofThumbs();
  }

  /* V2.3: One entrance light sweep on hero viewport entry */
  const tfLightCut = document.querySelector(".tf-light-cut");
  const heroEl = document.querySelector(".q-hero");
  if (tfLightCut && heroEl && !skipReveal && "IntersectionObserver" in window) {
    const heroIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !tfLightCut.classList.contains("tf-sweep")) {
          setTimeout(() => { tfLightCut.classList.add("tf-sweep"); }, 900);
          heroIO.disconnect();
        }
      });
    }, { threshold: 0.25 });
    heroIO.observe(heroEl);
  }

  /* FAQ tracking */
  document.querySelectorAll(".q-faq-list details").forEach((d, i) => {
    d.addEventListener("toggle", () => {
      if (!d.open) return;
      track("faq_open", { faq_index: i + 1, faq_question: compact(d.querySelector("summary") ? d.querySelector("summary").textContent : "") });
    });
  });

  /* Smooth scroll for nav */
  document.querySelectorAll('.q-nav a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: reducedMotion || saveData ? "auto" : "smooth", block: "start" }); }
    });
  });

  /* SOL-010: Ensure no BOM/zero-width in generated output (runtime check) */
  const htmlEl = document.documentElement;
  const firstChar = htmlEl.outerHTML.charCodeAt(0);
  if (firstChar === 0xFEFF || firstChar === 0x200B || firstChar === 0x200C || firstChar === 0x200D) {
    console.warn("QWEN-V2: BOM/zero-width marker detected in document source");
  }
})();
