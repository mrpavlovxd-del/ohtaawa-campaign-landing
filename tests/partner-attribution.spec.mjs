import { expect, test } from "@playwright/test";

const partnerPath = "/?scenario=partner_referral&experiment_id=wave17_partner_pilot&utm_content=opaque-partner-token";
const genericHeadline = "Бесплатная детейлинг-мойка кузова";

async function guardExternalRequests(page) {
  const externalRequests = [];
  await page.route("**/*", async (route) => {
    const request = route.request();
    const requestUrl = new URL(request.url());
    if (requestUrl.hostname === "127.0.0.1") {
      await route.continue();
      return;
    }

    externalRequests.push({
      method: request.method(),
      url: request.url()
    });
    await route.fulfill({
      status: 200,
      contentType: request.resourceType() === "script" ? "application/javascript" : "text/plain",
      body: ""
    });
  });
  return externalRequests;
}

async function installYmStub(page) {
  await page.addInitScript(() => {
    window.__ymCalls = [];
    window.ym = function () {
      const args = Array.from(arguments);
      window.__ymCalls.push(args);
      const callback = args[args.length - 1];
      if (typeof callback === "function") callback();
    };
  });
}

async function clickWithoutNavigation(page, selector) {
  return page.evaluate((ctaSelector) => {
    const cta = document.querySelector(ctaSelector);
    if (!cta) throw new Error(`CTA not found: ${ctaSelector}`);
    let appPrevented = null;
    cta.addEventListener("click", (event) => {
      appPrevented = event.defaultPrevented;
      event.preventDefault();
    }, { once: true });
    cta.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return {
      appPrevented,
      href: cta.getAttribute("href"),
      payload: window.ohtaawaLastEventPayload
    };
  }, selector);
}

test("partner referral keeps generic UI and preserves analytics attribution", async ({ page }, testInfo) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const externalRequests = await guardExternalRequests(page);
  await installYmStub(page);
  await page.goto(partnerPath, { waitUntil: "load" });

  const state = await page.evaluate(() => ({
    analyticsScenario: window.ohtaawaScenario,
    visualVariant: window.ohtaawaVariant,
    documentScenario: document.documentElement.getAttribute("data-ohtaawa-scenario"),
    documentVariant: document.documentElement.getAttribute("data-ohtaawa-variant"),
    heroVariant: document.querySelector(".hero")?.getAttribute("data-scenario"),
    headline: document.querySelector('[data-scenario-slot="headline"]')?.textContent,
    visit: window.ohtaawaVisitParams?.ohtaawa_landing,
    paramPayloads: window.__ymCalls
      .filter((call) => call[1] === "params")
      .map((call) => call[2].ohtaawa_landing),
    overflow: document.documentElement.scrollWidth - window.innerWidth
  }));

  expect(state.analyticsScenario).toBe("partner_referral");
  expect(state.visualVariant).toBe("generic");
  expect(state.documentScenario).toBe("partner_referral");
  expect(state.documentVariant).toBe("generic");
  expect(state.heroVariant).toBe("generic");
  expect(state.headline).toBe(genericHeadline);
  expect(state.visit).toMatchObject({
    scenario: "partner_referral",
    experiment_id: "wave17_partner_pilot",
    utm_content: "opaque-partner-token"
  });
  expect(state.paramPayloads).toHaveLength(2);
  expect(state.paramPayloads).toEqual([state.visit, state.visit]);
  expect(state.overflow).toBe(0);

  const cta = await clickWithoutNavigation(page, 'a[data-ohtaawa-event="lead_telegram_polish_film_v8"]');
  expect(cta.appPrevented).toBe(false);
  expect(cta.href).toBe("https://t.me/ohtaawa_chat");
  expect(cta.payload).toMatchObject({
    scenario: "partner_referral",
    experiment_id: "wave17_partner_pilot",
    utm_content: "opaque-partner-token",
    destination: "telegram"
  });
  expect(await page.evaluate(() => window.__ymCalls.filter((call) => call[1] === "reachGoal"))).toHaveLength(2);
  expect(externalRequests.length).toBeGreaterThan(0);
  expect(externalRequests.every((request) => new URL(request.url).hostname === "mc.yandex.ru")).toBe(true);
  expect(pageErrors).toEqual([]);

  await page.screenshot({ path: testInfo.outputPath("partner-referral-generic-ui.png"), fullPage: false });
});

test("unknown scenario is generic while explicit attribution fields survive", async ({ page }) => {
  const externalRequests = await guardExternalRequests(page);
  await page.goto("/?scenario=constructor&utm_campaign=film_new&experiment_id=unknown_case&utm_content=opaque-unknown&_ym_debug=1", { waitUntil: "load" });

  const state = await page.evaluate(() => {
    const initial = {
      analyticsScenario: window.ohtaawaScenario,
      visualVariant: window.ohtaawaVariant,
      headline: document.querySelector('[data-scenario-slot="headline"]')?.textContent,
      visit: window.ohtaawaVisitParams?.ohtaawa_landing
    };
    const accepted = ["generic", "crm", "new-car", "used-car", "partner_referral"].map((value) => ({
      requested: value,
      analytics: window.ohtaawaApplyScenario(value, { updateUrl: false }),
      visual: window.ohtaawaVariant
    }));
    const rejected = ["constructor", "toString", "arbitrary_value"].map((value) => ({
      requested: value,
      analytics: window.ohtaawaApplyScenario(value, { updateUrl: false }),
      visual: window.ohtaawaVariant
    }));
    return { accepted, initial, rejected };
  });

  expect(state.initial).toMatchObject({
    analyticsScenario: "generic",
    visualVariant: "generic",
    headline: genericHeadline,
    visit: {
      scenario: "generic",
      experiment_id: "unknown_case",
      utm_content: "opaque-unknown"
    }
  });
  expect(state.accepted).toEqual([
    { requested: "generic", analytics: "generic", visual: "generic" },
    { requested: "crm", analytics: "crm", visual: "crm" },
    { requested: "new-car", analytics: "new-car", visual: "new-car" },
    { requested: "used-car", analytics: "used-car", visual: "used-car" },
    { requested: "partner_referral", analytics: "partner_referral", visual: "generic" }
  ]);
  expect(state.rejected.every((entry) => entry.analytics === "generic" && entry.visual === "generic")).toBe(true);
  expect(externalRequests).toEqual([]);
});

for (const qaMode of [
  { name: "_ym_debug query", path: `${partnerPath}&_ym_debug=1`, preseed: false },
  { name: "preseeded QA flag", path: partnerPath, preseed: true }
]) {
  test(`${qaMode.name} suppresses network analytics but keeps local payloads`, async ({ page }) => {
    if (qaMode.preseed) {
      await page.addInitScript(() => {
        window.__ohtaawaQa = true;
      });
    }
    const externalRequests = await guardExternalRequests(page);
    await page.goto(qaMode.path, { waitUntil: "load" });

    const ctaSelectors = [
      'a[data-ohtaawa-location="hero"][data-ohtaawa-event="lead_telegram_polish_film_v8"]',
      'a[data-ohtaawa-location="hero"][data-ohtaawa-event="lead_whatsapp_polish_film_v8"]',
      'a[data-ohtaawa-location="hero"][data-ohtaawa-event="lead_max_direct_polish_film_v8"]',
      'a[data-ohtaawa-location="hero"][data-ohtaawa-event="lead_phone_polish_film_v8"]'
    ];
    const ctaResults = [];
    await page.evaluate(() => {
      window.ohtaawaQaEvents = [];
    });
    for (const selector of ctaSelectors) {
      ctaResults.push(await clickWithoutNavigation(page, selector));
    }

    const qaState = await page.evaluate(() => ({
      dataLayerExists: Object.prototype.hasOwnProperty.call(window, "dataLayer"),
      metricaScriptCount: document.querySelectorAll('script[src*="mc.yandex.ru"]').length,
      qa: window.__ohtaawaQa,
      qaEvents: window.ohtaawaQaEvents,
      visit: window.ohtaawaVisitParams?.ohtaawa_landing,
      ymType: typeof window.ym
    }));

    expect(ctaResults.map((result) => result.appPrevented)).toEqual([false, false, false, false]);
    expect(ctaResults.map((result) => result.href)).toEqual([
      "https://t.me/ohtaawa_chat",
      expect.stringMatching(/^https:\/\/wa\.me\/79910102020\?text=/),
      "https://max.ru/u/f9LHodD0cOI5wt5WT7UlPEsbpi4oIsz6xG3oS67WnEdrB3Btf3BZUshskUk",
      "tel:+78127678840"
    ]);
    expect(qaState.qa).toBe(true);
    expect(qaState.ymType).toBe("undefined");
    expect(qaState.metricaScriptCount).toBe(0);
    expect(qaState.dataLayerExists).toBe(false);
    expect(qaState.qaEvents).toHaveLength(4);
    expect(qaState.qaEvents.every((payload) => payload.scenario === "partner_referral")).toBe(true);
    expect(qaState.qaEvents.every((payload) => payload.experiment_id === "wave17_partner_pilot")).toBe(true);
    expect(qaState.qaEvents.every((payload) => payload.utm_content === "opaque-partner-token")).toBe(true);
    expect(qaState.visit).toMatchObject({
      scenario: "partner_referral",
      experiment_id: "wave17_partner_pilot",
      utm_content: "opaque-partner-token"
    });
    expect(externalRequests).toEqual([]);
  });
}
