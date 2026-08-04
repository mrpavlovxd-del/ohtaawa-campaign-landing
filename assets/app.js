(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var configNode = document.getElementById("landing-config");
  if (!configNode) return;

  var config = JSON.parse(configNode.textContent);
  var params = new URLSearchParams(window.location.search);
  var requestedScenario = (params.get("scenario") || "").toLowerCase();
  var requestedUiScenario = (params.get("ui_scenario") || "").toLowerCase();
  var attributionScenario = requestedScenario || config.serviceRoute;
  var uiScenario = requestedUiScenario || config.serviceRoute;
  var fired = Object.create(null);
  var contactOrigin = "";
  var toastTimer = null;

  function isQaVisit() {
    var debug = (params.get("_ym_debug") || "").toLowerCase();
    var marker = [
      params.get("utm_source") || "",
      params.get("utm_medium") || "",
      params.get("utm_campaign") || "",
      params.get("utm_content") || "",
      params.get("experiment_id") || ""
    ].join(" ").toLowerCase();

    return /^(1|true|yes)$/.test(debug) || /(^|\s|_)(qa|codex|smoke)(\s|_|$)/.test(marker);
  }

  var qaVisit = isQaVisit();
  var experimentId = params.get("experiment_id") || config.experimentId;

  window.ohtaawaLanding = {
    version: config.landingVersion,
    route: config.serviceRoute,
    offerId: config.offerId,
    scenario: attributionScenario,
    uiScenario: uiScenario,
    experimentId: experimentId,
    analyticsDisabled: qaVisit
  };

  function eventPayload(name, details) {
    details = details || {};
    var contactEvents = [
      "hero_cta_click",
      "contact_sheet_open",
      "channel_open",
      "messenger_click",
      "phone_click"
    ];

    return {
      event: name,
      event_name: name,
      page: "ohtaawa_wave43_full_film",
      landing_version: config.landingVersion,
      service_route: config.serviceRoute,
      scenario: attributionScenario,
      ui_scenario: uiScenario,
      offer_id: config.offerId,
      experiment_id: experimentId,
      conversion_stage: contactEvents.indexOf(name) >= 0 ? "soft_contact" : "behavior",
      client_time: new Date().toISOString(),
      location: details.location || "",
      contact_origin: details.contactOrigin || contactOrigin || "",
      destination: details.destination || "",
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || ""
    };
  }

  function sendEvent(name, details, done) {
    var payload = eventPayload(name, details);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);

    var completed = false;
    function finish() {
      if (completed) return;
      completed = true;
      if (typeof done === "function") done();
    }

    if (!qaVisit && typeof window.ym === "function") {
      var timer = window.setTimeout(finish, 350);
      window.ym(config.metrikaCounter, "reachGoal", name, payload, function () {
        window.clearTimeout(timer);
        finish();
      });
    } else {
      finish();
    }
  }

  function sendOnce(name, details) {
    if (!name || fired[name]) return;
    fired[name] = true;
    sendEvent(name, details);
  }

  function initMetrika() {
    if (qaVisit) return;

    window.ym = window.ym || function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
    window.ym.l = Date.now();

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://mc.yandex.ru/metrika/tag.js?id=" + config.metrikaCounter;
    document.head.appendChild(script);

    window.ym(config.metrikaCounter, "init", {
      ssr: true,
      webvisor: true,
      clickmap: true,
      accurateTrackBounce: true,
      trackLinks: true,
      referrer: document.referrer,
      url: window.location.href
    });

    window.ym(config.metrikaCounter, "params", {
      ohtaawa_landing: {
        landing_version: config.landingVersion,
        service_route: config.serviceRoute,
        scenario: attributionScenario,
        ui_scenario: uiScenario,
        offer_id: config.offerId,
        experiment_id: experimentId,
        qa_visit: "no",
        utm_source: params.get("utm_source") || "",
        utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || "",
        utm_content: params.get("utm_content") || "",
        utm_term: params.get("utm_term") || ""
      }
    });
  }

  function showToast(message) {
    var toast = document.querySelector("[data-toast]");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3000);
  }

  function initContactSheet() {
    var dialog = document.getElementById("contact-sheet");
    if (!dialog) return;

    function openContact(origin) {
      contactOrigin = origin || "unknown";
      sendEvent("hero_cta_click", {
        location: contactOrigin,
        contactOrigin: contactOrigin,
        destination: "contact_sheet"
      });

      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
      document.body.classList.add("is-dialog-open");
      sendEvent("contact_sheet_open", {
        location: contactOrigin,
        contactOrigin: contactOrigin,
        destination: "contact_sheet"
      });
    }

    function closeContact() {
      if (dialog.open && typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
      document.body.classList.remove("is-dialog-open");
    }

    document.querySelectorAll("[data-open-contact]").forEach(function (node) {
      node.addEventListener("click", function () {
        openContact(node.getAttribute("data-contact-location") || "unknown");
      });
    });

    var closeButton = dialog.querySelector("[data-close-contact]");
    if (closeButton) closeButton.addEventListener("click", closeContact);
    dialog.addEventListener("close", function () {
      document.body.classList.remove("is-dialog-open");
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) closeContact();
    });
  }

  function copyPreparedMessage(node) {
    var channel = node.getAttribute("data-channel");
    var message = node.getAttribute("data-copy-message") || "";
    if (!message || (channel !== "telegram" && channel !== "max")) return;
    if (!navigator.clipboard || !navigator.clipboard.writeText) return;

    navigator.clipboard.writeText(message).then(function () {
      showToast("Текст обращения скопирован. Вставьте его в открывшийся чат.");
    }).catch(function () {});
  }

  function initContactLinks() {
    document.querySelectorAll("[data-channel]").forEach(function (node) {
      var channel = node.getAttribute("data-channel");
      var message = node.getAttribute("data-copy-message") || "";

      if (channel === "whatsapp" && message) {
        node.setAttribute("href", config.whatsappUrl + "?text=" + encodeURIComponent(message));
      }

      node.addEventListener("click", function (event) {
        copyPreparedMessage(node);
        var details = {
          location: "contact_sheet",
          contactOrigin: contactOrigin,
          destination: channel
        };

        if (channel === "phone") {
          event.preventDefault();
          sendEvent("phone_click", details, function () {
            window.location.href = node.getAttribute("href");
          });
          return;
        }

        sendEvent("channel_open", details);
        sendEvent("messenger_click", details);
      });
    });
  }

  function initTrackedLinks() {
    document.querySelectorAll("[data-track-event]").forEach(function (node) {
      node.addEventListener("click", function (event) {
        var eventName = node.getAttribute("data-track-event");
        var href = node.getAttribute("href") || "";
        var details = {
          location: node.getAttribute("data-track-location") || "",
          destination: eventName === "map_click" ? "yandex_maps" : "phone"
        };

        if (href.indexOf("tel:") === 0) {
          event.preventDefault();
          sendEvent(eventName, details, function () {
            window.location.href = href;
          });
          return;
        }

        sendEvent(eventName, details);
      });
    });
  }

  function initViewTracking() {
    var nodes = document.querySelectorAll("[data-view-event]");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (node) {
        sendOnce(node.getAttribute("data-view-event"), { location: "fallback_view" });
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.3) return;
        sendOnce(entry.target.getAttribute("data-view-event"), {
          location: entry.target.id || "section_view"
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: [0.3, 0.6] });

    nodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  function initReveal() {
    var nodes = document.querySelectorAll("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !("IntersectionObserver" in window)) {
      nodes.forEach(function (node) {
        node.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -7% 0px", threshold: 0.06 });

    nodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  function initScrollTracking() {
    var ticking = false;

    function measure() {
      ticking = false;
      var documentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      var viewportBottom = window.scrollY + window.innerHeight;
      var depth = documentHeight <= window.innerHeight ? 100 : viewportBottom / documentHeight * 100;
      if (depth >= 50) sendOnce("scroll_50", { location: "page" });
      if (depth >= 90) sendOnce("scroll_90", { location: "page" });
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(measure);
    }, { passive: true });

    measure();
  }

  function initInspectionLight() {
    var hero = document.querySelector(".hero");
    var heroLight = document.querySelector("[data-inspection-light]");
    var proof = document.querySelector("[data-proof-stage]");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    function bind(node, target, property) {
      if (!node || !target) return;
      node.addEventListener("pointermove", function (event) {
        var rect = node.getBoundingClientRect();
        var percent = Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100));
        target.style.setProperty(property, percent.toFixed(2) + "%");
      }, { passive: true });
    }

    bind(hero, heroLight, "--scan-x");
    bind(proof, proof, "--proof-x");
  }

  function initMobileContact() {
    var button = document.querySelector(".mobile-contact");
    var hero = document.querySelector(".hero");
    if (!button || !hero) return;

    var ticking = false;
    function sync() {
      ticking = false;
      var mobile = window.matchMedia("(max-width: 820px)").matches;
      button.classList.toggle("is-visible", mobile && window.scrollY > hero.offsetHeight * 0.58);
    }

    function requestSync() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(sync);
    }

    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);
    sync();
  }

  function initFaqTracking() {
    document.querySelectorAll(".faq-list details").forEach(function (node, index) {
      node.addEventListener("toggle", function () {
        if (!node.open) return;
        sendEvent("faq_open", { location: "faq_" + (index + 1), destination: "content" });
      });
    });
  }

  function initDeadlineCountdown() {
    var node = document.querySelector("[data-deadline]");
    if (!node) return;

    var deadline = new Date(node.getAttribute("data-deadline"));
    var daysNode = node.querySelector("[data-countdown-days]");
    var hoursNode = node.querySelector("[data-countdown-hours]");
    if (Number.isNaN(deadline.getTime()) || !daysNode || !hoursNode) return;

    function render() {
      var remaining = Math.max(0, deadline.getTime() - Date.now());
      var totalHours = Math.floor(remaining / 3600000);
      var days = Math.floor(totalHours / 24);
      var hours = totalHours % 24;
      daysNode.textContent = String(days).padStart(2, "0");
      hoursNode.textContent = String(hours).padStart(2, "0");
    }

    render();
    window.setInterval(render, 60000);
  }

  initMetrika();
  initContactSheet();
  initContactLinks();
  initTrackedLinks();
  initViewTracking();
  initReveal();
  initScrollTracking();
  initInspectionLight();
  initMobileContact();
  initFaqTracking();
  initDeadlineCountdown();
  sendOnce("landing_view", { location: "page_load" });
})();
